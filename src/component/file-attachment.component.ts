namespace bluesky.core.components {

    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;
    import IFileAttachmentService = bluesky.core.services.IFileAttachmentService;
    import ApplicationOriginEnum = bluesky.core.models.ApplicationOriginEnum;

    export interface IFileAttachmentComponentBindings {
        elementIdBinding?: number;
        originBinding?: ApplicationOriginEnum;
    }

    export interface IFileAttachmentComponentController extends IFileAttachmentComponentBindings {
        attachedFileList: Array<FileAttachment>;
        attachedFileListSource: Array<FileAttachment>;

        downloadAttachedFile(fileAttachment: FileAttachment): void;
        deleteAttachedFile(fileAttachment: FileAttachment): void;

        hasCurrentUserUploadRights: boolean;

        selectedFiles: Array<File>;
        selectedFile: File;
        fileInvalidMessageArray: Array<string>;
        onFileSelected: (files: Array<File>, file: File, newFiles: Array<File>, duplicateFiles: Array<File>, invalidFiles: Array<File>, event: JQueryEventObject) => void;
        importSelectedFile(): void;
        clearSelectedFiles(): void;

        //TODO MGA: only Jquery event has necessary properties to know source event, check why angular typings doesn't contain necessary params
        onCommentInputKeyPress: ($event: JQueryEventObject, fileAttachment: FileAttachment) => boolean;

        updateFileAttachmentComment(fileAttachment: FileAttachment): void;
        /**
         * Check new comment input against validation rules, update VM to inform the view of potential errors.
         * @param fileAttachment 
         * @returns {boolean} true if input is invalid, otherwise false. 
         */
        onUpdatedCommentValidateInput(fileAttachment: FileAttachment): boolean;
        cancelEditComment(fileAttachment: FileAttachment): void;

        convertBytesToMegaBytes(bytes: number): number;

        nbOfItemsPerPage: number;

        supportedExtensions: Array<string>;

        httpPromises: Array<ng.IPromise<any>>;
    }

    export class FileAttachmentComponentController implements IFileAttachmentComponentController {

        //#region binding prop

        elementIdBinding: number;
        originBinding: ApplicationOriginEnum;

        //#endregion

        //#region vm prop

        attachedFileList: Array<FileAttachment>;
        attachedFileListSource: Array<FileAttachment>;
        hasCurrentUserUploadRights = false;
        selectedFiles: Array<File>;
        selectedFile: File;
        fileInvalidMessageArray: Array<string>;
        nbOfItemsPerPage: number;
        httpPromises: Array<ng.IPromise<any>>;
        supportedExtensions: Array<string>;

        //#endregion

        //#region private fields

        maxFileSize = 20000000; //in bytes = 20mb

        //#endregion

        //#region ctor

        /* @ngInject */
        constructor(
            private $log: ng.ILogService,
            private toaster: ngtoaster.IToasterService,
            private _: UnderscoreStatic,
            private fileAttachmentService: IFileAttachmentService,
            private fileAttachmentOriginEnum: FileAttachmentOriginEnum,
            private applicationOriginEnum: ApplicationOriginEnum
        ) {
            if (!this.elementIdBinding) {
                this.$log.error('parameter {elementIdBinding} is mandatory.');
                return;
            }

            if (!this.applicationOriginEnum[this.originBinding]) {
                this.$log.error('parameter {originBinding} is mandatory.');
                return;
            }

            this.httpPromises = new Array<ng.IPromise<any>>();

            // get list of attached files for current element
            this.getAttachedFiles();

            // get flag to know if current user has upload rights for current item
            this.getCurrentUserUploadRights();

            // get supported mime types for file upload, based on srv info
            this.getSupportedExtensions();

            this.nbOfItemsPerPage = 10;

            this.fileInvalidMessageArray = new Array<string>();
        }

        //#endregion

        //#region vm / public methods

        public downloadAttachedFile(fileAttachment: FileAttachment): void {
            if (!fileAttachment || !fileAttachment.Id) return;

            var httpPromise = this.fileAttachmentService.downloadAttachedFile(fileAttachment, this.fileAttachmentOriginEnum[fileAttachment.FileOrigin]).then(() => {
                //TODO MGA ? or leave as is.
            });

            this.httpPromises.push(httpPromise);
        }

        public deleteAttachedFile(fileAttachment: FileAttachment): void {
            if (!fileAttachment || !fileAttachment.Id) return;

            var httpPromise = this.fileAttachmentService.deleteAttachedFile(fileAttachment.Id, this.fileAttachmentOriginEnum[fileAttachment.FileOrigin]).then(() => {
                this.toaster.success(`File (${fileAttachment.FileName}) successfully deleted.`);
                this.getAttachedFiles();
            });

            this.httpPromises.push(httpPromise);
        }

        public updateFileAttachmentComment(fileAttachment: FileAttachment): void {
            if (!fileAttachment || !fileAttachment.Id || !fileAttachment.updatedComment) return;

            if (!this.onUpdatedCommentValidateInput(fileAttachment)) return; // check validation rules are ok

            var httpPromise = this.fileAttachmentService.editFileAttachmentComment(fileAttachment.Id, this.fileAttachmentOriginEnum[fileAttachment.FileOrigin], fileAttachment.updatedComment).then(() => {
                this.clearEditCommentMode(fileAttachment); //TODO MGA: useless if we reload all data from srv
                // retrieve update list of files with updated file comment from srv : TODO MGA improve reload (costly)
                this.getAttachedFiles();
                // TODO MGA : highlight updated comment ?
            });

            this.httpPromises.push(httpPromise);
        }

        /**
         * TODO MGA: improve inline-form error handling & UI feedback ! not dynamic // fluid to use
         * @param fileAttachment
         */
        public onUpdatedCommentValidateInput = (fileAttachment: FileAttachment): boolean => {
            if (!fileAttachment.updatedComment || fileAttachment.updatedComment.length < 1) {
                fileAttachment.updatedCommentErrorMessage = 'comment must be non-empty';
                return false;
            } else if (fileAttachment.updatedComment && fileAttachment.updatedComment.length >= 255) {
                fileAttachment.updatedCommentErrorMessage = 'comment must be < 255 characters';
                return false;
            } else {
                fileAttachment.updatedCommentErrorMessage = null; //reset error message to flag comment as valid
                return true;
            }
        }

        /**
         * Handler dedicated to prevent on keypress='enter' the submission of a form if this component is inside one.
         * Instead, it pushes the new value 
         */
        public onCommentInputKeyPress = ($event: JQueryEventObject, fileAttachment: FileAttachment): boolean => {

            var keyCode = $event.keyCode || $event.which;

            if (keyCode === 13) { // 'Enter' key pressed
                //prevent form submission
                $event.preventDefault();
                //call 
                this.updateFileAttachmentComment(fileAttachment);

                return false; //TODO MGA: necessary ?
            }

            return true;
        }

        public cancelEditComment(fileAttachment: FileAttachment): void {
            fileAttachment.editCommentMode = false;
            //fileAttachment.updatedComment = ""; // TODO MGA: decide behavior ? better to keep last entry ? but then we must also keep error message
            //fileAttachment.updatedCommentErrorMessage = null;
        }

        //TODO MGA: handle multiple files & clean up view bindings
        public onFileSelected(files: Array<File>, file: File, newFiles: Array<File>, duplicateFiles: Array<File>, invalidFiles: Array<File>, event: JQueryEventObject): void {
            if (!files && !file) return;

            this.fileInvalidMessageArray = []; //reset error array

            if (files) {
                this.selectedFiles = files;
            }
            if (file) {
                this.selectedFile = file;
            }

            if (files && files.length > 1) {
                this.fileInvalidMessageArray.push('Cannot upload multiple files at ounce. Please select only one file.');
                return;
            }

            //var fileExtension = file.name.substr(file.name.lastIndexOf('.') + 1);
            var fileFormatSupported = _(this.supportedExtensions).any(supportedExtension => this.selectedFile.getFileExtension() === supportedExtension);

            //var fileFormatSupported = file.type && //If file.type is null / empty, that means current OS doesn't know about the file format => delegate to server to validate if format is valid, we can't know client-side.
            //    _(this.supportedExtensions).any((supportedMimeType) => file.type === supportedMimeType);

            if (!fileFormatSupported)
                this.fileInvalidMessageArray.push(`Unsupported file format: '${this.selectedFile.type}' with extension: '${this.selectedFile.getFileExtension()}'`);

            if (!this.selectedFile.size)
                this.fileInvalidMessageArray.push('Selected file is empty.');
            else if (this.selectedFile.size >= this.maxFileSize)
                this.fileInvalidMessageArray.push(`Selected file is bigger (${this.convertBytesToMegaBytes(this.selectedFile.size)}mb) than authorized file size: ${this.convertBytesToMegaBytes(this.maxFileSize)}mb`);
        }

        public importSelectedFile(): void {
            if (!this.selectedFile || _(this.fileInvalidMessageArray).any()) return; //TODO MGA $log

            var httpPromise = this.fileAttachmentService.attachFile(this.elementIdBinding, this.originBinding, this.selectedFile).then(() => {
                this.toaster.success(`File (${this.selectedFile.name}) successfully uploaded.`);
                this.getAttachedFiles(); //TODO MGA : highlight new entry ?
            }).finally(() => {
                //clean up selected file
                this.clearSelectedFiles();
            });

            this.httpPromises.push(httpPromise);
        }

        public clearSelectedFiles(): void {
            this.selectedFiles = null;
            this.selectedFile = null;
            this.fileInvalidMessageArray = []; // clear error messages
            //this.fileSelectedIsValid = true;
        }

        public convertBytesToMegaBytes(bytes: number): number {
            return +(bytes / 1000000).toFixed(2); //converts back to number 2-digits string representation of original conversion.
        }

        //#endregion

        //#region private methods

        private getAttachedFiles(): void {
            var httpPromise = this.fileAttachmentService.getAttachedFiles(this.elementIdBinding, this.originBinding).then((fileAttachmentList) => {
                this.attachedFileList = fileAttachmentList;
                this.attachedFileListSource = fileAttachmentList; //TODO MGA : duplicate ? to prevent update to source list if collection modified ?
            });

            this.httpPromises.push(httpPromise);
        }

        private getSupportedExtensions(): void {
            var httpPromise = this.fileAttachmentService.getSupportedExtensions().then((supportedExtensions) => {
                this.supportedExtensions = _(supportedExtensions).uniq();
            });

            this.httpPromises.push(httpPromise);
        }

        private clearEditCommentMode(fileAttachment: FileAttachment) {
            fileAttachment.editCommentMode = false;
            fileAttachment.updatedComment = null;
            fileAttachment.updatedCommentErrorMessage = null;
        }

        private getCurrentUserUploadRights(): void {
            this.fileAttachmentService
                .getCurrentUserUploadRights(this.elementIdBinding, this.originBinding)
                .then(booleanResponse => {
                    this.hasCurrentUserUploadRights = booleanResponse;
                });
        }

        //#endregion
    }

    export class FileAttachmentComponent implements ng.IComponentOptions {

        public bindings: any;
        public controller: any;
        public controllerAs: string;
        public templateUrl: string;

        constructor() {

            this.bindings = {
                elementIdBinding: '=',
                originBinding: '='
            };

            this.controller = FileAttachmentComponentController;
            this.controllerAs = 'vm';
            this.templateUrl = 'component/file-attachment.tpl.html';
        }
    }

    angular.module('bluesky.core.components.fileAttachment', [
        'cgBusy',
        'smart-table',
        'toaster',
        'file-attachment-component-tpl',
        'bluesky.core.services.fileAttachment',
        'bluesky.core.models.fileAttachmentOriginEnum',
        'bluesky.core.models.applicationOriginEnum'
    ])
        //TODO MGA: make this uniform for each directives // share behavior
        .value('cgBusyDefaults', { templateUrl: 'templates/angular-busy/angular-busy-custom.tpl.html' })
        .constant('_', window['_'])
        .constant('moment', window['moment'])
        .component('fileAttachmentComponent', new FileAttachmentComponent());

}
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

        fileAttachmentDownloadLinkElementId: string;

        getAttachedFiles(): void;
        downloadAttachedFile: (fileAttachment: FileAttachment) => void;
        deleteAttachedFile: (fileAttachment: FileAttachment) => void;
        getSupportedMimeTypes(): void;

        hasCurrentUserUploadRights: boolean;

        selectedFile: File;
        fileInvalidMessageArray: Array<string>;
        onFileSelected: (file: File, event: ng.angularFileUpload.IFileProgressEvent) => void;
        importSelectedFile: () => void;
        clearSelectedFile: () => void;

        editCommentMode: boolean;
        cancelEditComment: () => void;

        convertBytesToMegaBytes(bytes: number): number;

        isSelectFileBtnDisabled: () => boolean;

        nbOfItemsPerPage: number;

        supportedMimeTypes: Array<string>;

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
        fileAttachmentDownloadLinkElementId = 'file-attachment-download-link'; //TODO MGA : to const ?
        hasCurrentUserUploadRights = false;
        selectedFile: File;
        fileInvalidMessageArray: Array<string>;
        nbOfItemsPerPage: number;
        httpPromises: Array<ng.IPromise<any>>;
        supportedMimeTypes: Array<string>;
        editCommentMode = false;

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
            this.getSupportedMimeTypes();

            this.nbOfItemsPerPage = 10;

            this.fileInvalidMessageArray = new Array<string>();
        }

        //#endregion


        //#region vm methods

        getAttachedFiles(): void {
            var httpPromise = this.fileAttachmentService.getAttachedFiles(this.elementIdBinding, this.originBinding).then((fileAttachmentList) => {
                this.attachedFileList = fileAttachmentList;
                this.attachedFileListSource = fileAttachmentList; //TODO MGA : duplicate ? to prevent update to source list if collection modified ?
            });

            this.httpPromises.push(httpPromise);
        }

        getSupportedMimeTypes(): void {
            var httpPromise = this.fileAttachmentService.getSupportedMimeTypes().then((supportedMimeTypes) => {
                this.supportedMimeTypes = _(supportedMimeTypes).uniq();
            });

            this.httpPromises.push(httpPromise);
        }

        downloadAttachedFile(fileAttachment: FileAttachment): void {
            if (!fileAttachment || !fileAttachment.Id) return;

            var jQueryAnchorElement = $('#' + this.fileAttachmentDownloadLinkElementId); //add id selector

            var httpPromise = this.fileAttachmentService.downloadAttachedFile(fileAttachment, this.fileAttachmentOriginEnum[fileAttachment.FileOrigin], jQueryAnchorElement).then(() => {
                //TODO MGA ? or leave as is.
            });

            this.httpPromises.push(httpPromise);
        }

        deleteAttachedFile(fileAttachment: FileAttachment): void {
            if (!fileAttachment || !fileAttachment.Id) return;

            var httpPromise = this.fileAttachmentService.deleteAttachedFile(fileAttachment.Id, this.fileAttachmentOriginEnum[fileAttachment.FileOrigin]).then(() => {
                this.toaster.success(`File (${fileAttachment.FileName}) successfully deleted.`);
                this.getAttachedFiles();
            });

            this.httpPromises.push(httpPromise);
        }

        updateFileAttachmentComment(fileAttachment: FileAttachment, updatedComment: string): void {
            if (!fileAttachment || !fileAttachment.Id || !updatedComment) return;

            var httpPromise = this.fileAttachmentService.editFileAttachmentComment(fileAttachment.Id, this.fileAttachmentOriginEnum[fileAttachment.FileOrigin], updatedComment).then(() => {
                this.editCommentMode = false;
                // retrieve update list of files with updated file comment from srv : TODO MGA improve reload (costly)
                this.getAttachedFiles();
                // TODO MGA : highlight updated comment ?
            });

            this.httpPromises.push(httpPromise);
        }

        cancelEditComment(): void {
            this.editCommentMode = false;
        }

        onFileSelected(file: File, event: ng.angularFileUpload.IFileProgressEvent): void {
            if (!file) return;

            this.fileInvalidMessageArray = []; //reset error array

            var fileFormatSupported = file.type && //If file.type is null / empty, that means current OS doesn't know about the file format => delegate to server to validate if format is valid, we can't know client-side.
                _(this.supportedMimeTypes).any((supportedMimeType) => file.type === supportedMimeType);

            if (!fileFormatSupported)
                this.fileInvalidMessageArray.push(`Unsupported file format: '${file.type}'`); //TODO MGA: convert to readable extension from mime type

            var fileSizeSupported = file.size && file.size < this.maxFileSize;

            if (!fileSizeSupported)
                this.fileInvalidMessageArray.push(`Selected file is bigger (${this.convertBytesToMegaBytes(file.size)}mb) than authorized file size: ${this.convertBytesToMegaBytes(this.maxFileSize)}mb`);
        }

        importSelectedFile(): void {
            if (!this.selectedFile || _(this.fileInvalidMessageArray).any()) return; //TODO MGA $log

            var httpPromise = this.fileAttachmentService.attachFile(this.elementIdBinding, this.originBinding, this.selectedFile).then(() => {
                this.toaster.success(`File (${this.selectedFile.name}) successfully uploaded.`);
                this.getAttachedFiles(); //TODO MGA : highlight new entry ?
            }).finally(() => {
                //clean up selected file
                this.clearSelectedFile();
            });

            this.httpPromises.push(httpPromise);
        }

        clearSelectedFile(): void {
            this.selectedFile = null;
            this.fileInvalidMessageArray = []; // clear error messages
            //this.fileSelectedIsValid = true;
        }

        //TODO MGA
        isSelectFileBtnDisabled(): boolean { return false; }

        convertBytesToMegaBytes(bytes: number): number {
            return +(bytes / 1000000).toFixed(2); //converts back to number 2-digits string representation of original conversion.
        }

        //#endregion

        //#region private methods

        getCurrentUserUploadRights(): void {
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
        .component('fileAttachmentComponent', new FileAttachmentComponent());

}
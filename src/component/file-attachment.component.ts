namespace bluesky.core.components {

    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;
    import IFileAttachmentService = bluesky.core.services.IFileAttachmentService;

    export interface IFileAttachmentComponentBindings {
        elementIdBinding?: number;
        originBinding?: FileAttachmentOriginEnum;
    }

    export interface IFileAttachmentComponentController extends IFileAttachmentComponentBindings {
        attachedFileList: Array<FileAttachment>;
        attachedFileListSource: Array<FileAttachment>;

        fileAttachmentDownloadLinkElementId: string;

        getAttachedFiles(): void;
        downloadAttachedFile: (fileAttachment: FileAttachment) => void;
        deleteAttachedFile: (fileAttachment: FileAttachment) => void;

        fileToUpload: string;

        fileSelected: (file: File, event: ng.angularFileUpload.IFileProgressEvent) => void;

        openSelectFileDialog: () => void;
        isSelectFileBtnDisabled: () => boolean;

        nbOfItemsPerPage: number;

        httpPromises: Array<ng.IPromise<any>>;
    }

    export class FileAttachmentComponentController implements IFileAttachmentComponentController {

        //#region binding prop

        elementIdBinding: number;
        originBinding: FileAttachmentOriginEnum;

        //#endregion

        //#region vm prop

        attachedFileList: Array<FileAttachment>;
        attachedFileListSource: Array<FileAttachment>;
        fileAttachmentDownloadLinkElementId = 'file-attachment-download-link'; //TODO MGA : to const ?
        fileToUpload: string;
        nbOfItemsPerPage: number;
        httpPromises: Array<ng.IPromise<any>>;

        //#endregion

        //#region ctor

        /* @ngInject */
        constructor(
            private $log: ng.ILogService,
            private toaster: ngtoaster.IToasterService,
            private fileAttachmentService: IFileAttachmentService
        ) {
            if (!this.elementIdBinding) {
                this.$log.error('parameter {elementIdBinding} is mandatory.');
                return;
            }

            if (!FileAttachmentOriginEnum[this.originBinding]) {
                this.$log.error('parameter {originBinding} is mandatory.');
                return;
            }

            this.httpPromises = new Array<ng.IPromise<any>>();

            // call srv to get list of files
            this.getAttachedFiles();

            this.nbOfItemsPerPage = 10;
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

        downloadAttachedFile(fileAttachment: FileAttachment): void {
            if (!fileAttachment || !fileAttachment.Id) return;

            var jQueryAnchorElement = $('#' + this.fileAttachmentDownloadLinkElementId); //add id selector

            var httpPromise = this.fileAttachmentService.downloadAttachedFile(fileAttachment, this.originBinding, jQueryAnchorElement).then(() => {
                //TODO MGA ? or leave as is.
            });

            this.httpPromises.push(httpPromise);
        }

        deleteAttachedFile(fileAttachment: FileAttachment): void {
            if (!fileAttachment || !fileAttachment.Id) return;

            var httpPromise = this.fileAttachmentService.deleteAttachedFile(fileAttachment.Id, this.originBinding).then(() => {
                this.toaster.success(`File (${fileAttachment.FileName}) successfully deleted.`);
                this.getAttachedFiles();
            });

            this.httpPromises.push(httpPromise);
        }

        updateFileAttachmentComment(fileAttachment: FileAttachment, updatedComment: string): void {
            if (!fileAttachment || !fileAttachment.Id || !updatedComment) return;

            var httpPromise = this.fileAttachmentService.editFileAttachmentComment(fileAttachment.Id, this.originBinding, updatedComment).then(() => {
                //TODO MGA : highlight updated comment ? + get out of edit mode
            });

            this.httpPromises.push(httpPromise);
        }

        fileSelected(file: File, event: ng.angularFileUpload.IFileProgressEvent): void {
            if (!file) return;

            var httpPromise = this.fileAttachmentService.attachFile(this.elementIdBinding, this.originBinding, file).then(() => {
                this.toaster.success(`File (${file.name}) successfully uploaded.`);
                this.getAttachedFiles(); //TODO MGA : highlight new entry ?
            });

            this.httpPromises.push(httpPromise);
        }

        openSelectFileDialog(): void {
            //TODO MGA : simulate user direct click to input file field (hidden but used for AT tests)
            $('#input-file-select-field').click();
        }

        //TODO MGA
        isSelectFileBtnDisabled(): boolean { return false; }

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

    angular.module('bluesky.quoteWizard.components.fileAttachment', [
        'cgBusy',
        'smart-table',
        'toaster',
        'file-attachment-component-tpl',
        'bluesky.quoteWizard.services.fileAttachment'
    ])
    //TODO MGA: make this uniform for each directives // share behavior
    .value('cgBusyDefaults', { templateUrl: 'templates/angular-busy/angular-busy-custom.tpl.html' })
    .component('fileAttachmentComponent', new FileAttachmentComponent());

}
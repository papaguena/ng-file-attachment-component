declare namespace bluesky.core.components {
    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;
    import IFileAttachmentService = bluesky.core.services.IFileAttachmentService;
    interface IFileAttachmentComponentBindings {
        elementIdBinding?: number;
        originBinding?: FileAttachmentOriginEnum;
    }
    interface IFileAttachmentComponentController extends IFileAttachmentComponentBindings {
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
    class FileAttachmentComponentController implements IFileAttachmentComponentController {
        private $log;
        private toaster;
        private fileAttachmentService;
        elementIdBinding: number;
        originBinding: FileAttachmentOriginEnum;
        attachedFileList: Array<FileAttachment>;
        attachedFileListSource: Array<FileAttachment>;
        fileAttachmentDownloadLinkElementId: string;
        fileToUpload: string;
        nbOfItemsPerPage: number;
        httpPromises: Array<ng.IPromise<any>>;
        constructor($log: ng.ILogService, toaster: ngtoaster.IToasterService, fileAttachmentService: IFileAttachmentService);
        getAttachedFiles(): void;
        downloadAttachedFile(fileAttachment: FileAttachment): void;
        deleteAttachedFile(fileAttachment: FileAttachment): void;
        updateFileAttachmentComment(fileAttachment: FileAttachment, updatedComment: string): void;
        fileSelected(file: File, event: ng.angularFileUpload.IFileProgressEvent): void;
        openSelectFileDialog(): void;
        isSelectFileBtnDisabled(): boolean;
    }
    class FileAttachmentComponent implements ng.IComponentOptions {
        bindings: any;
        controller: any;
        controllerAs: string;
        templateUrl: string;
        constructor();
    }
}

declare namespace bluesky.core.models {
    /**
     * TODO MGA : decide on practice to share enums with srv etc
     */
    enum FileAttachmentOriginEnum {
        QuoteWizardFileAttachment = 0,
        OrderEntryCustomDetails = 1,
        OrderEntryAudioCustomDetail = 2,
        OrderTrackingFileAttachment = 3,
    }
}

declare namespace bluesky.core.models {
    /**
     * TODO MGA : export an interface too ?
     */
    class FileAttachment {
        Id: number;
        FileName: string;
        Comment: string;
        UploadedBy: string;
        CreationDate: string;
        Origin: string;
        constructor(Id: number, FileName: string, Comment: string, UploadedBy: string, CreationDate: string, Origin: string);
    }
}

declare namespace bluesky.core.services {
    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;
    interface IFileAttachmentService {
        getAttachedFiles(elementId: number, origin: FileAttachmentOriginEnum): ng.IPromise<Array<FileAttachment>>;
        attachFile(elementId: number, origin: FileAttachmentOriginEnum, fileToUpload: File): ng.IPromise<any>;
        downloadAttachedFile(fileAttachment: FileAttachment, origin: FileAttachmentOriginEnum, anchorElement: JQuery): ng.IPromise<void>;
        deleteAttachedFile(fileAttachmentId: number, origin: FileAttachmentOriginEnum): ng.IPromise<void>;
        editFileAttachmentComment(fileAttachmentId: number, origin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void>;
    }
    class FileAttachmentService implements IFileAttachmentService {
        private httpWrapperService;
        private $log;
        private $timeout;
        private Upload;
        private Blob;
        private FileSaver;
        constructor(httpWrapperService: IHttpWrapperService, $log: ng.ILogService, $timeout: ng.ITimeoutService, Upload: ng.angularFileUpload.IUploadService, Blob: any, FileSaver: any);
        getAttachedFiles(elementId: number, origin: FileAttachmentOriginEnum): ng.IPromise<Array<FileAttachment>>;
        downloadAttachedFile(fileAttachment: FileAttachment, origin: FileAttachmentOriginEnum, anchorElement: JQuery): ng.IPromise<void>;
        deleteAttachedFile(fileAttachmentId: number, origin: FileAttachmentOriginEnum): ng.IPromise<void>;
        attachFile(elementId: number, origin: FileAttachmentOriginEnum, fileToUpload: File): ng.IPromise<any>;
        editFileAttachmentComment(fileAttachmentId: number, origin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void>;
    }
}

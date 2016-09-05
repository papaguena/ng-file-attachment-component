declare namespace bluesky.core.services {
    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;
    import ApplicationOriginEnum = bluesky.core.models.ApplicationOriginEnum;
    interface IFileAttachmentService {
        getAttachedFiles(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<Array<FileAttachment>>;
        attachFile(elementId: number, applicationOrigin: ApplicationOriginEnum, fileToUpload: File): ng.IPromise<any>;
        downloadAttachedFile(fileAttachment: FileAttachment, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void>;
        deleteAttachedFile(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void>;
        editFileAttachmentComment(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void>;
        getSupportedExtensions(): ng.IPromise<Array<string>>;
        getSupportedMimeTypes(): ng.IPromise<Array<string>>;
        getCurrentUserUploadRights(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<boolean>;
    }
    class FileAttachmentService implements IFileAttachmentService {
        private httpWrapperService;
        private $log;
        private $timeout;
        private Upload;
        private Blob;
        private FileSaver;
        private fileAttachmentOriginEnum;
        private applicationOriginEnum;
        constructor(httpWrapperService: IHttpWrapperService, $log: ng.ILogService, $timeout: ng.ITimeoutService, Upload: ng.angularFileUpload.IUploadService, Blob: any, FileSaver: any, fileAttachmentOriginEnum: FileAttachmentOriginEnum, applicationOriginEnum: ApplicationOriginEnum);
        getAttachedFiles(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<Array<FileAttachment>>;
        attachFile(elementId: number, applicationOrigin: ApplicationOriginEnum, fileToUpload: File): ng.IPromise<any>;
        downloadAttachedFile(fileAttachment: FileAttachment, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void>;
        deleteAttachedFile(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void>;
        editFileAttachmentComment(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void>;
        getSupportedExtensions(): ng.IPromise<Array<string>>;
        getSupportedMimeTypes(): ng.IPromise<Array<string>>;
        getCurrentUserUploadRights(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<boolean>;
    }
}

/**
 * Extends the File native type with a new method 'getFileExtension'
 */
interface File {
    getFileExtension(): string;
}

declare namespace bluesky.core.components {
    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;
    import IFileAttachmentService = bluesky.core.services.IFileAttachmentService;
    import ApplicationOriginEnum = bluesky.core.models.ApplicationOriginEnum;
    interface IFileAttachmentComponentBindings {
        elementIdBinding?: number;
        originBinding?: ApplicationOriginEnum;
    }
    interface IFileAttachmentComponentController extends IFileAttachmentComponentBindings {
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
        switchToEditCommentMode(fileAttachment: FileAttachment): void;
        onCommentInputKeyPress: ($event: JQueryEventObject, fileAttachment: FileAttachment) => void;
        updateFileAttachmentComment(fileAttachment: FileAttachment): void;
        /**
         * Check new comment input against validation rules, update VM to inform the view of potential errors.
         * @param fileAttachment
         * @returns {boolean} true if input is invalid, otherwise false.
         */
        onUpdatedCommentValidateInput(fileAttachment: FileAttachment): boolean;
        cancelEditComment(fileAttachment: FileAttachment): void;
        bytesToFormatedString(bytes: number): string;
        nbOfItemsPerPage: number;
        supportedExtensions: Array<string>;
        httpPromises: Array<ng.IPromise<any>>;
    }
    class FileAttachmentComponentController implements IFileAttachmentComponentController {
        private $log;
        private toaster;
        private _;
        private fileAttachmentService;
        private fileAttachmentOriginEnum;
        private applicationOriginEnum;
        elementIdBinding: number;
        originBinding: ApplicationOriginEnum;
        attachedFileList: Array<FileAttachment>;
        attachedFileListSource: Array<FileAttachment>;
        hasCurrentUserUploadRights: boolean;
        selectedFiles: Array<File>;
        selectedFile: File;
        fileInvalidMessageArray: Array<string>;
        nbOfItemsPerPage: number;
        httpPromises: Array<ng.IPromise<any>>;
        supportedExtensions: Array<string>;
        constructor($log: ng.ILogService, toaster: ngtoaster.IToasterService, _: UnderscoreStatic, fileAttachmentService: IFileAttachmentService, fileAttachmentOriginEnum: FileAttachmentOriginEnum, applicationOriginEnum: ApplicationOriginEnum);
        onFileSelected(files: Array<File>, file: File, newFiles: Array<File>, duplicateFiles: Array<File>, invalidFiles: Array<File>, event: JQueryEventObject): void;
        importSelectedFile(): void;
        clearSelectedFiles(): void;
        downloadAttachedFile(fileAttachment: FileAttachment): void;
        deleteAttachedFile(fileAttachment: FileAttachment): void;
        bytesToFormatedString(bytes: number): string;
        switchToEditCommentMode(fileAttachment: FileAttachment): void;
        updateFileAttachmentComment(fileAttachment: FileAttachment): void;
        /**
         * TODO MGA: improve inline-form error handling & UI feedback ! not dynamic // fluid to use
         * @param fileAttachment
         */
        onUpdatedCommentValidateInput: (fileAttachment: FileAttachment) => boolean;
        /**
         * Handler dedicated to prevent on keypress='enter' the submission of a form if this component is inside one.
         * Instead, it pushes the new value
         */
        onCommentInputKeyPress: ($event: JQueryEventObject, fileAttachment: FileAttachment) => void;
        cancelEditComment(fileAttachment: FileAttachment): void;
        private getAttachedFiles();
        private getSupportedExtensions();
        private clearEditCommentMode(fileAttachment);
        private getCurrentUserUploadRights();
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
    enum ApplicationOriginEnum {
        QuoteWizard = 0,
        OrderEntry = 1,
        OrderTracking = 2,
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
        UploaderInformation: UserInformation;
        CreationDate: string;
        FileOrigin: string;
        CanCurrentUserDownloadFile: boolean;
        CanCurrentUserDeleteFile: boolean;
        CanCurrentUserEditComment: boolean;
        editCommentMode: boolean;
        updatedComment: string;
        updatedCommentErrorMessage: string;
        constructor(Id: number, FileName: string, Comment: string, UploaderInformation: UserInformation, CreationDate: string, FileOrigin: string, CanCurrentUserDownloadFile: boolean, CanCurrentUserDeleteFile: boolean, CanCurrentUserEditComment: boolean, editCommentMode: boolean, updatedComment: string, updatedCommentErrorMessage: string);
    }
    class UserInformation {
        FirstName: string;
        LastName: string;
        DisplayName: string;
        userIdentifier: string;
        Email: string;
        PhoneNumber: string;
        constructor(FirstName: string, LastName: string, DisplayName: string, userIdentifier: string, Email: string, PhoneNumber: string);
    }
}

declare namespace bluesky.core.models {
    class JsonBooleanResponse {
        booleanResponse: boolean;
        constructor(booleanResponse: boolean);
    }
}

namespace bluesky.core.services {

    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileContent = bluesky.core.models.FileContent;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;
    import ApplicationOriginEnum = bluesky.core.models.ApplicationOriginEnum;
    import JsonBooleanResponse = bluesky.core.models.JsonBooleanResponse;

    export interface IFileAttachmentService {

        getAttachedFiles(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<Array<FileAttachment>>;

        attachFile(elementId: number, applicationOrigin: ApplicationOriginEnum, fileToUpload: File): ng.IPromise<any>;

        downloadAttachedFile(fileAttachment: FileAttachment, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void>;

        deleteAttachedFile(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void>;

        editFileAttachmentComment(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void>;

        getSupportedMimeTypes(): ng.IPromise<Array<string>>;

        getCurrentUserUploadRights(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<boolean>;
    }

    export class FileAttachmentService implements IFileAttachmentService {

        /* @ngInject */
        constructor(
            private httpWrapperService: IHttpWrapperService,
            private $log: ng.ILogService,
            private $timeout: ng.ITimeoutService,
            private Upload: ng.angularFileUpload.IUploadService,
            private Blob: any, //TODO MGA: typings ?
            private FileSaver: any, //TODO MGA: typings ?
            private fileAttachmentOriginEnum: FileAttachmentOriginEnum,
            private applicationOriginEnum: ApplicationOriginEnum
        ) {

        }

        getAttachedFiles(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<Array<FileAttachment>> {
            //TODO MGA : cleaner params handling to pass to http call
            return this.httpWrapperService.get<Array<FileAttachment>>('file-attachment/search', {
                params: { 'elementId': elementId, 'applicationOrigin': this.applicationOriginEnum[applicationOrigin] },
                apiEndpoint: true
            });
        }

        attachFile(elementId: number, applicationOrigin: ApplicationOriginEnum, fileToUpload: File): ng.IPromise<any> {
            if (!fileToUpload) {
                this.$log.warn('[fileAttachmentService.attachFile] file is empty, aborting upload.');
                return null;
            }

            //TODO MGA: we should rely on a stronger http-wrapper to handle upload this way
            return this.Upload.base64DataUrl(fileToUpload).then((fileBase64Url) => {
                return this.httpWrapperService.post<any>('file-attachment/put',
                    //TODO MGA : create model for AttachFileDto & FileUploadBaseDto
                    {
                        'ElementId': elementId,
                        'ApplicationOrigin': this.applicationOriginEnum[applicationOrigin],
                        'FileUploadBaseDto': {
                            'FileName': fileToUpload.name,
                            'FileBase64Url': fileBase64Url.slice(fileBase64Url.indexOf('base64,') + 'base64,'.length), //strip the dataUri part of the base64 encoding to only keep base64 raw data.
                            'ContentType': fileToUpload.type
                        }
                    }, {
                        apiEndpoint: true,
                        uploadInBase64Json: true
                    });
            });
        }

        downloadAttachedFile(fileAttachment: FileAttachment, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void> {
            if (!fileAttachment || !fileAttachment.Id || !fileAttachment.FileName) {
                this.$log.error('[fileAttachment] mandatory.');
                return null;
            }

            return this.httpWrapperService.getFile('file-attachment/download', {
                params: { 'fileAttachmentId': fileAttachment.Id, 'fileOrigin': this.fileAttachmentOriginEnum[fileOrigin] },
                apiEndpoint: true
            }).then<void>((file: FileContent) => {

                //TODO MGA: extract file download as a separate service

                //var filewithBOM = '\uFEFF'+ file; //Add BOM UTF-8 before ? for now delayed to FileSaver.saveAs() flag autoBOM parameter.
                var blob = new Blob([file.content], { type: file.type });
                //var blob = new Blob([file], { type: 'application/octet-stream;utf-8' });
                //var blob = new Blob([file], { type: 'image/png;charset=windows-1252' });
                //var blob = new Blob([file], { type: 'image/png;charset=ISO-8859-1' });

                this.FileSaver.saveAs(blob, file.name || fileAttachment.FileName || 'unknown.bin'); // autoBOM enabled by default

                return;
            });
        }

        deleteAttachedFile(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum): ng.IPromise<void> {
            return this.httpWrapperService.delete<void>('file-attachment/delete', {
                params: { 'fileAttachmentId': fileAttachmentId, 'fileOrigin': this.fileAttachmentOriginEnum[fileOrigin] },
                apiEndpoint: true
            });
        }

        editFileAttachmentComment(fileAttachmentId: number, fileOrigin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void> {
            return this.httpWrapperService.post<void>('file-attachment/update-comment',
                //TODO MGA : create Dto client-side or update endpoint srv-side to support part-params url + comment as payload (cleaner SOC).
                {
                    'FileAttachmentId': fileAttachmentId,
                    'FileOrigin': this.fileAttachmentOriginEnum[fileOrigin],
                    'Comment': updatedComment
                }, { apiEndpoint: true });
        }

        getSupportedMimeTypes(): ng.IPromise<Array<string>> {
            return this.httpWrapperService.get<Array<string>>('file-attachment/authorized-mime-types', { apiEndpoint: true });
        }

        getCurrentUserUploadRights(elementId: number, applicationOrigin: ApplicationOriginEnum): ng.IPromise<boolean> {
            return this.httpWrapperService.get<JsonBooleanResponse>('file-attachment/get-current-user-upload-rights',
                {
                    params: { 'elementId': elementId, 'applicationOrigin': this.applicationOriginEnum[applicationOrigin] },
                    apiEndpoint: true
                })
                .then((response) => response.booleanResponse);
        }

    }

    angular.module('bluesky.core.services.fileAttachment', [
        'ng.httpWrapper',
        'ngFileUpload',
        'ngFileSaver',
        'bluesky.core.models.fileAttachmentOriginEnum',
        'bluesky.core.models.applicationOriginEnum'
    ]).service('fileAttachmentService', FileAttachmentService);
}
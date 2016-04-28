namespace bluesky.core.services {

    import FileAttachment = bluesky.core.models.FileAttachment;
    import FileAttachmentOriginEnum = bluesky.core.models.FileAttachmentOriginEnum;

    export interface IFileAttachmentService {

        getAttachedFiles(elementId: number, origin: FileAttachmentOriginEnum): ng.IPromise<Array<FileAttachment>>;

        attachFile(elementId: number, origin: FileAttachmentOriginEnum, fileToUpload: File): ng.IPromise<any>;

        downloadAttachedFile(fileAttachment: FileAttachment, origin: FileAttachmentOriginEnum, anchorElement: JQuery): ng.IPromise<void>;

        deleteAttachedFile(fileAttachmentId: number, origin: FileAttachmentOriginEnum): ng.IPromise<void>;

        editFileAttachmentComment(fileAttachmentId: number, origin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void>;
    }

    export class FileAttachmentService implements IFileAttachmentService {

        /* @ngInject */
        constructor(
            private httpWrapperService: IHttpWrapperService,
            private $log: ng.ILogService,
            private $timeout: ng.ITimeoutService,
            private Upload: ng.angularFileUpload.IUploadService,
            private Blob: any, //TODO MGA: typings ?
            private FileSaver: any //TODO MGA: typings ?
        ) {

        }

        getAttachedFiles(elementId: number, origin: FileAttachmentOriginEnum): ng.IPromise<Array<FileAttachment>> {
            //TODO MGA : cleaner params handling to pass to http call
            return this.httpWrapperService.get<Array<FileAttachment>>('file-attachment/search', {
                params: { 'elementId': elementId, 'origin': FileAttachmentOriginEnum[origin] },
                apiEndpoint: true
            });
        }

        downloadAttachedFile(fileAttachment: FileAttachment, origin: FileAttachmentOriginEnum, anchorElement: JQuery): ng.IPromise<void> {
            if (!fileAttachment || !fileAttachment.Id || !fileAttachment.FileName) {
                this.$log.error('[fileAttachment] mandatory.');
                return null;
            }

            if (!anchorElement) {
                this.$log.error('[anchorElement] mandatory.');
                return null;
            }

            return this.httpWrapperService.get<File>('file-attachment/download', {
                params: { 'fileAttachmentId': fileAttachment.Id, 'origin': FileAttachmentOriginEnum[origin] },
                apiEndpoint: true
            }).then<void>((file: File) => {
                //var filewithBOM = '\uFEFF'+ file;
                var blob = new Blob([file], { type: 'application/octet-stream;utf-8' }); //TODO MGA: type ??? how to retrieve content-type from blob
                //var blob = new Blob([file], { type: 'image/png;charset=windows-1252' }); //TODO MGA: type ??? how to retrieve content-type from blob
                //var blob = new Blob([file], { type: 'image/png;charset=ISO-8859-1' }); //TODO MGA: type ??? how to retrieve content-type from blob
                //var blob = new Blob([file], { type: 'image/png' }); //TODO MGA: type ??? how to retrieve content-type from blob

                this.FileSaver.saveAs(blob, fileAttachment.FileName || 'unknown.bin');

                //var url = window.URL.createObjectURL(blob);

                ////TODO MGA: delay to to be outside of current digest cycle : how to fix ?
                //this.$timeout(() => {
                //    anchorElement
                //        .attr({
                //            "href": url,
                //            "download": 'unknown.png'
                //            //"download": fileAttachmentName || 'unknown.bin'
                //        })
                //        //.html($("a").attr("download"))
                //        .get(0).click();

                //    window.URL.revokeObjectURL(url);
                //    // TODO MGA : hack to trigger download of file from JS, to refactor in a directive + see Jquery limitations of click event : http://stackoverflow.com/questions/17311645/download-image-with-javascript 
                //    //anchorElement.prop('href', url);
                //    //anchorElement.prop('download', fileAttachmentName || 'unknown.bin'); //TODO MGA ???

                //    //anchorElement.get(0).click();
                //}, 0);


                //anchorElement.click();

                //setTimeout(function () {
                // Added a small delay because file was removed to quickly in firefox and the download was even not initialized
                // Remove temp element from browser cache : TODO MGA find a way to do this in a finally() clause in the service method ?
                //window.URL.revokeObjectURL(url);
                //}, 100);

                return;
            });
        }

        deleteAttachedFile(fileAttachmentId: number, origin: FileAttachmentOriginEnum): ng.IPromise<void> {
            return this.httpWrapperService.delete<void>('file-attachment/delete', {
                params: { 'fileAttachmentId': fileAttachmentId, 'origin': FileAttachmentOriginEnum[origin] },
                apiEndpoint: true
            });
        }

        attachFile(elementId: number, origin: FileAttachmentOriginEnum, fileToUpload: File): ng.IPromise<any> {
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
                        'Origin': FileAttachmentOriginEnum[origin],
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

        editFileAttachmentComment(fileAttachmentId: number, origin: FileAttachmentOriginEnum, updatedComment: string): ng.IPromise<void> {
            return this.httpWrapperService.post<void>('file-attachment/update-comment',
                //TODO MGA : create Dto client-side or update endpoint srv-side to support part-params url + comment as payload (cleaner SOC).
                {
                    'FileAttachmentId': fileAttachmentId,
                    'Origin': FileAttachmentOriginEnum[origin],
                    'Comment': updatedComment
                }, { apiEndpoint: true });
        }
    }

    angular.module('bluesky.quoteWizard.services.fileAttachment', ['ng.httpWrapper', 'ngFileUpload', 'ngFileSaver'])
           .service('fileAttachmentService', FileAttachmentService);
}
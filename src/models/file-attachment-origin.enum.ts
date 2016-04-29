namespace bluesky.core.models {
    /**
     * TODO MGA : decide on practice to share enums with srv etc
     */
    export enum FileAttachmentOriginEnum {
        QuoteWizardFileAttachment,
        OrderEntryCustomDetails,
        OrderEntryAudioCustomDetail,
        OrderTrackingFileAttachment
    }

    /**
     * declared as angular module to be injected at runtime inside controllers/services to use it as a dictionnary.
     * Otherwise, we are not sure the reference to this object will ve known at runtime due to order of evaluation of imports inside generated js.
     */
    angular.module('bluesky.core.models.fileAttachmentOriginEnum', [])
           .constant('fileAttachmentOriginEnum', FileAttachmentOriginEnum);
}
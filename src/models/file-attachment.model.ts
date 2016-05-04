namespace bluesky.core.models {

    /**
     * TODO MGA : export an interface too ?
     */
    export class FileAttachment {
        constructor(
            //srv-side properties
            public Id: number,
            public FileName: string,
            public Comment: string,
            public UploaderInformation: UserInformation,
            public CreationDate: string,
            public FileOrigin: string,
            public CanCurrentUserDownloadFile: boolean,
            public CanCurrentUserDeleteFile: boolean,
            public CanCurrentUserEditComment: boolean,
            //client-side properties
            public editCommentMode: boolean,
            public updatedComment: string,
            public updatedCommentErrorMessage: string
        ) { }
    }

    export class UserInformation {
        constructor(
            public FirstName: string,
            public LastName: string,
            public DisplayName: string,
            public userIdentifier: string,
            public Email: string,
            public PhoneNumber: string
        ) { }
    }
}
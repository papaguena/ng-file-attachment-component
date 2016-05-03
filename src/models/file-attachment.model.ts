namespace bluesky.core.models {

    /**
     * TODO MGA : export an interface too ?
     */
    export class FileAttachment {
        constructor(
            public Id: number,
            public FileName: string,
            public Comment: string,
            public UploaderInformation: UserInformation,
            public CreationDate: string,
            public FileOrigin: string
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
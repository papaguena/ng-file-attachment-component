namespace bluesky.core.models {

    /**
     * TODO MGA : export an interface too ?
     */
    export class FileAttachment {
        constructor(
            public Id: number,
            public FileName: string,
            public Comment: string,
            public UploadedBy: string,
            public CreationDate: string,
            public Origin: string
        ) { }
    }
}
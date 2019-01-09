export const storageModel =
{
    Id: numberOrNull,
    Content: stringOrNull,
    FileName: stringOrNull,
    MimeType: stringOrNull
};

export type StorageType = Readonly<typeof storageModel>;

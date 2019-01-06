const numberOrNull: number | null = null;
const stringOrNull: string | null = null;

export const storageModel =
{
    Id: numberOrNull,
    Content: stringOrNull,
    FileName: stringOrNull,
    MimeType: stringOrNull
};

export type StorageType = Readonly<typeof storageModel>;

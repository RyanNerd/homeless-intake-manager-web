export interface IHTMLElement extends HTMLElement
{
    value: any;
    name: string;
    type: string;
    checked?: boolean;
}

export interface ITarget extends EventTarget
{
    type: string;
    value: any;
    checked: boolean | null | undefined;
    name: string;
}

export interface INodeListOf extends NodeListOf<Element> {
    [Symbol.iterator](): IterableIterator<IHTMLElement>;
}

/* tslint:disable: ban-types */
interface IFormatValue {
    formatValue: Function;
}

export interface IDocument extends Document
{
    l10n: IFormatValue;
}

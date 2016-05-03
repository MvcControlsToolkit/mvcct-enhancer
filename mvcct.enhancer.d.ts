declare namespace mvcct {
    export namespace enhancer {
        export interface InputSupportOption {
            force: boolean;
            type: number;
        }
        export interface InputSupportOptions {
            number: InputSupportOption;
            range: InputSupportOption;
            date: InputSupportOption;
            month: InputSupportOption;
            week: InputSupportOption;
            time: InputSupportOption;
            datetime: InputSupportOption;
            email: InputSupportOption;
            search: InputSupportOption;
            tel: InputSupportOption;
            url: InputSupportOption;
            color: InputSupportOption;
        }
        export interface BrowserSupportOptions {
            cookie: string;
            forms: string;
            fallbacks: InputSupportOptions;
        }
        export interface Html5InputOriginalSupport {
            number: boolean;
            range: boolean;
            date: boolean;
            month: boolean;
            week: boolean;
            time: boolean;
            datetime: boolean;
            email: boolean;
            search: boolean;
            tel: boolean;
            url: boolean;
            color: boolean;
        }
        export interface Html5InputSupport {
            number: number;
            range: number;
            date: number;
            month: number;
            week: number;
            time: number;
            datetime: number;
            email: number;
            search: number;
            tel: number;
            url: number;
            color: number;
        }
        export interface Formats{
            dateFormat: string;
            timeFormat: string;
            timeFormat1: string;
            datetimeFormat: string;
            datetimeFormat1: string;
            monthFormat: string;
            weekFormat: string;
        }
        export interface Options {
            browserSupport?: BrowserSupportOptions;
            editFormats?: Formats;
            [propName: string]: any;
        }
        export interface Html5Infos {
            Html5InputOriginalSupport: Html5InputOriginalSupport;
            Html5InputSupport: Html5InputSupport;
        }

        export function init(options: Options): void;
        export function waitAsync(options: Options): void;
        export function asyncReady(): void;
        export function register(node: HTMLElement,
            initialize: boolean,
            processOptions: (options: Options) => void,
            name: string,
            highPriority?: boolean): void;
        export function transform(node: HTMLElement): void;
        export function dependency(name: string,
            sourceNode: HTMLElement,
            targetNode: HTMLElement,
            eventNames: string[],
            action: (targetNode: HTMLElement, sourceNode: HTMLElement) => void): any;
        export function removeDependency(handle: any): void;
        export function getSupport(): Html5Infos;
        export function addBasicInput(globalize: any);
    }
}

declare module "mvcct.enhancer" {
    export = mvcct.enhancer
}
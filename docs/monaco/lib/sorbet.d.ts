export default class SorbetServer {
    static create(responseCallback: (response: string) => any, errorCallback: (error: any) => any): Promise<SorbetServer>;
    private _destroyed;
    private _sorbet;
    onResponse: (response: string) => any;
    onError: (error: any) => any;
    private _onResponseEmscripten;
    private constructor();
    private _print;
    private _printErr;
    private _destroy;
    sendMessage(msg: string): void;
}
//# sourceMappingURL=sorbet.d.ts.map
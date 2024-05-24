/**
 * Creates a new Sorbet instances. Calls errorCallback if Sorbet quits or
 * fails to start up.
 */
export declare function createSorbet(onPrint: (line: string) => void, onAbort: (error: any) => void): Promise<{
    sorbet: any;
}>;
//# sourceMappingURL=sorbet.d.ts.map
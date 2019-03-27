declare global {
    interface Window {
        lspCallback: (message: string) => void;
        callLSP(message: string): void;
    }
}
export {};
//# sourceMappingURL=client.d.ts.map
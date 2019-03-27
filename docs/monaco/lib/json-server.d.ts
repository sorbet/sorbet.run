import Uri from 'vscode-uri';
import { MessageReader, MessageWriter } from "vscode-jsonrpc";
import { IConnection, TextDocuments } from 'vscode-languageserver';
import { TextDocument, Diagnostic, Command, CompletionList, CompletionItem, Hover, SymbolInformation, DocumentSymbolParams, TextEdit, FoldingRange, ColorInformation, ColorPresentation } from "vscode-languageserver-types";
import { TextDocumentPositionParams, DocumentRangeFormattingParams, ExecuteCommandParams, CodeActionParams, FoldingRangeRequestParam, DocumentColorParams, ColorPresentationParams } from 'vscode-languageserver-protocol';
import { LanguageService, JSONDocument } from "vscode-json-languageservice";
export declare function start(reader: MessageReader, writer: MessageWriter): JsonServer;
export declare class JsonServer {
    protected readonly connection: IConnection;
    protected workspaceRoot: Uri | undefined;
    protected readonly documents: TextDocuments;
    protected readonly jsonService: LanguageService;
    protected readonly pendingValidationRequests: Map<string, number>;
    constructor(connection: IConnection);
    start(): void;
    protected getFoldingRanges(params: FoldingRangeRequestParam): FoldingRange[];
    protected findDocumentColors(params: DocumentColorParams): Thenable<ColorInformation[]>;
    protected getColorPresentations(params: ColorPresentationParams): ColorPresentation[];
    protected codeAction(params: CodeActionParams): Command[];
    protected format(params: DocumentRangeFormattingParams): TextEdit[];
    protected findDocumentSymbols(params: DocumentSymbolParams): SymbolInformation[];
    protected executeCommand(params: ExecuteCommandParams): any;
    protected hover(params: TextDocumentPositionParams): Thenable<Hover | null>;
    protected resovleSchema(url: string): Promise<string>;
    protected resolveCompletion(item: CompletionItem): Thenable<CompletionItem>;
    protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null>;
    protected validate(document: TextDocument): void;
    protected cleanPendingValidation(document: TextDocument): void;
    protected doValidate(document: TextDocument): void;
    protected cleanDiagnostics(document: TextDocument): void;
    protected sendDiagnostics(document: TextDocument, diagnostics: Diagnostic[]): void;
    protected getJSONDocument(document: TextDocument): JSONDocument;
}
//# sourceMappingURL=json-server.d.ts.map
'use strict';

import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind
} from 'vscode-languageserver';

import {
	TagHelperParser
} from './features/tagHelper/tagHelperParser';

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

let documents: TextDocuments = new TextDocuments();
documents.listen(connection);

let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			completionProvider: {
				resolveProvider: true
			}
		}
	}
});

documents.onDidChangeContent(change => {
	console.log('File changed');
	// sTagHelperParser.getCompletionItems
});

interface Settings {
	razorServer: ServerSettings; 
}

interface ServerSettings {
	maxNumberOfProblems: number;
}

let maxNumberOfProblems: number;

connection.onDidChangeConfiguration((change) => {
	let settings = <Settings>change.settings;
	maxNumberOfProblems = settings.razorServer.maxNumberOfProblems || 100;
});

connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
	let items = new Array<CompletionItem>();
	let document = documents.get(textDocumentPosition.textDocument.uri);
	let tagHelperItems = TagHelperParser.getCompletionItems(textDocumentPosition.position, document, workspaceRoot);
	if (tagHelperItems) items = items.concat(tagHelperItems);
	return [];
});

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	return item;
});

connection.listen();
import {
	createConnection, IConnection, ResponseError, InitializeParams, InitializeResult, InitializeError,
	Diagnostic, DiagnosticSeverity, Files, TextDocuments, TextDocument, ErrorMessageTracker, IPCMessageReader, IPCMessageWriter
} from 'vscode-languageserver';

import fs = require('fs');
import path = require('path');

import * as minimatch from 'minimatch';
import * as _ from 'lodash';

import processIgnoreFile = require('parse-gitignore');

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

let documents: TextDocuments = new TextDocuments();
documents.listen(connection);

let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	console.log('Razor server startet.')
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
	// validateTextDocument(change.document);
});

connection.listen();
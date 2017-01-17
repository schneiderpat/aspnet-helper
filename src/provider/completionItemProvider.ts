'use strict';

import * as vscode from 'vscode';
import IParser from './iParser';

export default class CompletionItemProvider implements vscode.CompletionItemProvider {

    private _parser: IParser;

    constructor(parser: IParser) {
        this._parser  = parser;
    }

    public provideCompletionItems(document: vscode.TextDocument,
                                    position: vscode.Position,
                                    token: vscode.CancellationToken): Thenable<vscode.CompletionList> {

        let start = new vscode.Position(position.line, 0);
        let range = new vscode.Range(start, position);
        let text = document.getText(range);

        let items = this._parser.getParsingResults(text, document);

        return Promise.resolve(items);

    }

}
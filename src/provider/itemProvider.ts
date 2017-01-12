'use strict';

import * as vscode from 'vscode';
import IParser from './iParser';

export default class ItemProvider implements vscode.CompletionItemProvider {

    private _parser: IParser;

    constructor(parser: IParser) {
        this._parser  = parser;
    }

    public provideCompletionItems(document: vscode.TextDocument,
                                    position: vscode.Position,
                                    token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {

        let start = new vscode.Position(position.line, 0);
        let range = new vscode.Range(start, position);
        let text = document.getText(range);

        let parsingResult = this._parser.getParsingResult(text);

        let suggestions = parsingResult.suggestions.map((v) => this.toSuggestion(v));

        return Promise.resolve(suggestions);

    }

    private toSuggestion(variant: string): vscode.CompletionItem {
        return new vscode.CompletionItem(variant);
    }

}
'use strict';

import * as vscode from 'vscode';
import IParser from './iParser';

export default class HoverProvider implements vscode.HoverProvider {

    private _parser: IParser;

    constructor(parser: IParser) {
        this._parser  = parser;
    }

    public provideHover(document: vscode.TextDocument,
                        position: vscode.Position,
                        token: vscode.CancellationToken): Thenable<vscode.Hover> {

        let wordRange = document.getWordRangeAtPosition(position, /.*(@Model\.[a-zA-Z]+).*/);
        let text = document.getText(wordRange);

        let hover = this._parser.getHoverResult(text, document);

        return Promise.resolve(hover);

    }

}
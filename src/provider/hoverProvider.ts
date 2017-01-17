'use strict';

import * as vscode from 'vscode';
import IParser from './iParser';

export default class HoverProvider implements vscode.HoverProvider {

    private _parser: IParser;

    public provideHover(document: vscode.TextDocument,
                        position: vscode.Position,
                        token: vscode.CancellationToken): Thenable<vscode.Hover> {

        let start = new vscode.Position(position.line, 0);
        let range = new vscode.Range(start, position);
        let text = document.getText(range);

        let hover = this._parser.getHoverResult(text, document);

        return Promise.resolve(hover);

    }

}
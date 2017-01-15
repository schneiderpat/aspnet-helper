'use strict'

import * as vscode from 'vscode';
import DeclarationInfo from './modelDeclarationInfo';
import IParser from '../iParser';

export default class ModelParser implements IParser {

    private _declarationInfo: DeclarationInfo;

    public getParsingResults(input: string, document: vscode.TextDocument): vscode.CompletionList {

        this._declarationInfo = new DeclarationInfo();

        return this.getItems(input, document);

    }

    getItems(input: string, document: vscode.TextDocument): vscode.CompletionList {

        let model = this._declarationInfo.getModel(document);

        return new vscode.CompletionList();

    }

}
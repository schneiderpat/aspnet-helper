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

        let model = this._declarationInfo.getCurrentModel(document);

        if (!model) return new vscode.CompletionList();

        let namespaces = this._declarationInfo.getNamespaces(document);

        let properties = this._declarationInfo.getProperties(model, namespaces);

        if (properties.length != 0) {
            let suggestions = new vscode.CompletionList();
            properties.forEach(p => {
                let item = new vscode.CompletionItem(p);
                suggestions.items.push(item);
            });
            return suggestions;
        }

        // if (body) get properties

        return new vscode.CompletionList();

    }

}
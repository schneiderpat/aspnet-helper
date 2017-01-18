'use strict'

import * as vscode from 'vscode';
import DeclarationInfo from './modelDeclarationInfo';
import IParser from '../iParser';

export default class ModelParser implements IParser {

    private _declarationInfo: DeclarationInfo;

    public getParsingResults(input: string, document: vscode.TextDocument): vscode.CompletionList {

        this._declarationInfo = new DeclarationInfo(document);

        return this.getItems(input);

    }

    getItems(input: string): vscode.CompletionList {

        let userWantsSuggestions = this._declarationInfo.userWantsProperties(input);

        if (!userWantsSuggestions) return new vscode.CompletionList();

        let model = this._declarationInfo.getCurrentModel();

        if (!model) return new vscode.CompletionList();

        let namespaces = this._declarationInfo.getNamespaces();

        let properties = this._declarationInfo.getProperties(model, namespaces);

        if (!properties) return new vscode.CompletionList();
        
        let suggestions = new vscode.CompletionList();
        let items = this._declarationInfo.convertPropertiesToCompletionItems(properties);
        suggestions.items = suggestions.items.concat(items);
        return suggestions;

    }

    public getHoverResult(input: string, document: vscode.TextDocument) {

        this._declarationInfo = new DeclarationInfo(document);

        let userWantsSinglePropertie = this._declarationInfo.userWantsSingleProperty(input);

        if (!userWantsSinglePropertie) return;

        let model = this._declarationInfo.getCurrentModel();

        if (!model) return;

        let namespaces = this._declarationInfo.getNamespaces();

        let properties = this._declarationInfo.getProperties(model, namespaces);

        if (!properties) return;
        properties = properties.filter(p => { return input.split('.')[1] === p.name })
        if (!properties) return;
        let hover = this._declarationInfo.convertPropertiesToHoverResult(properties[0]);
        return hover;

    }

}
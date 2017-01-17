'use strict';

import * as vscode from 'vscode';
import DeclarationInfo from './tagHelperDeclarationInfo';
import IParser from '../iParser';

export default class TagHelperParser implements IParser {

    private _declarationInfo: DeclarationInfo;

    public getParsingResults(input: string, document: vscode.TextDocument): vscode.CompletionList {

        this._declarationInfo = new DeclarationInfo(input, document);

        let items = this.getItems();

        return items;

    }

    getItems(): vscode.CompletionList {
        let suggestions = new vscode.CompletionList();

        let areas = this._declarationInfo.testForArea();
        suggestions.items = suggestions.items.concat(areas.items);

        let controllers = this._declarationInfo.testForController();
        if (controllers.items.length > 0) {
            suggestions = new vscode.CompletionList();
            suggestions.items = suggestions.items.concat(controllers.items);
        }

        let actions = this._declarationInfo.testForAction();
        if (actions.items.length > 0)
        {
            suggestions = new vscode.CompletionList();
            suggestions.items = suggestions.items.concat(actions.items);
        }

        let routeParams = this._declarationInfo.testForRouteParams();
        if (routeParams.items.length > 0)
        {
            suggestions = new vscode.CompletionList();
            suggestions.items = suggestions.items.concat(routeParams.items);
        }

        return suggestions;
    }
}
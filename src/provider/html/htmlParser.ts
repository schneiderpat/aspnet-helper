'use strict';

import * as vscode from 'vscode';
import DeclarationInfo from './declarationInfo';
import IParser from '../iParser';

export default class HtmlParser implements IParser {

    private _declarationInfo: DeclarationInfo;

    public getParsingResults(input: string): vscode.CompletionList {

        this._declarationInfo = new DeclarationInfo();

        let items = this.getItems(input);
        let userInput = this.getUserInput(input);

        return items;

    }

    getItems(input: string): vscode.CompletionList {
        let suggestions = new vscode.CompletionList();

        let areas = this._declarationInfo.testForArea(input);
        suggestions.items = suggestions.items.concat(areas.items);

        let controllers = this._declarationInfo.testForController(input);
        if (controllers.items.length > 0) {
            suggestions = new vscode.CompletionList();
            suggestions.items = suggestions.items.concat(controllers.items);
        }

        let actions = this._declarationInfo.testForAction(input);
        if (actions.items.length > 0)
        {
            suggestions = new vscode.CompletionList();
            suggestions.items = suggestions.items.concat(actions.items);
        }

        let routeParams = this._declarationInfo.testForRouteParams(input);
        if (routeParams.items.length > 0)
        {
            suggestions = new vscode.CompletionList();
            suggestions.items = suggestions.items.concat(routeParams.items);
        }

        return suggestions;
    }

    private getUserInput(input: string): string {
        let regExp = /"([a-zA-Z]+)$/;

        if (!regExp.test(input))
            return '';

        return regExp.exec(input)[0];
    }
}
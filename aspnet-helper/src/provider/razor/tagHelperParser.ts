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

        if (this._declarationInfo.userWantsAreas()) {
            let areaNames = this._declarationInfo.getAreaNames();
            let areaItems = this._declarationInfo.convertAreaNamesToCompletionItems(areaNames);
            suggestions.items = suggestions.items.concat(areaItems);
            return suggestions;
        }

        if (this._declarationInfo.userWantsControllers()) {
            let controllerNames = this._declarationInfo.getControllerNames();
            let controllerItems = this._declarationInfo.convertControllerNamesToCompletionItems(controllerNames);
            suggestions.items = suggestions.items.concat(controllerItems);
            return suggestions;
        }

        if (this._declarationInfo.userWantsActions()) {
            let actionResults = this._declarationInfo.getActionResults();
            let actionItems = this._declarationInfo.convertActionResultToCompletionItems(actionResults);
            suggestions.items = suggestions.items.concat(actionItems);
            return suggestions;
        }

        if (this._declarationInfo.userWantsRouteParams()) {
            let currentActionResult = this._declarationInfo.getCurrentActionResult();
            if (!currentActionResult.routeParams) return suggestions
            let routeItems = this._declarationInfo.convertRouteParamsToCompletionItems(currentActionResult.routeParams);
            suggestions.items = suggestions.items.concat(routeItems);
            return suggestions;
        }

        return suggestions;
    }

    public getHoverResult(input) {

    }
}
'use strict';

import { 
    CompletionItem,
    Position, TextDocument
} from 'vscode-languageserver';

import DeclarationInfo from './declarationInfo';

export class TagHelperParser {

    static getCompletionItems(position: Position, document: TextDocument, workspaceRoot: string): CompletionItem[] {

        let suggestions = new Array<CompletionItem>();
        let declarationInfo = new DeclarationInfo(position, document, workspaceRoot);

        if (declarationInfo.userWantsAspNet()) {
            let aspnetAttr = declarationInfo.getAspNetAttr();
            let aspnetItems = declarationInfo.convertAspNetAttrToCompletionItems(aspnetAttr);
            suggestions = suggestions.concat(aspnetItems);
            return suggestions;
        }

        if (declarationInfo.userWantsAreas()) {
            let areaNames = declarationInfo.getAreaNames();
            let areaItems = declarationInfo.convertAreaNamesToCompletionItems(areaNames);
            suggestions = suggestions.concat(areaItems);
            return suggestions;
        }

        if (declarationInfo.userWantsControllers()) {
            let controllerNames = declarationInfo.getControllerNames();
            let controllerItems = declarationInfo.convertControllerNamesToCompletionItems(controllerNames);
            suggestions = suggestions.concat(controllerItems);
            return suggestions;
        }

        if (declarationInfo.userWantsActions()) {
            let actionResults = declarationInfo.getActionResults();
            let actionItems = declarationInfo.convertActionResultToCompletionItems(actionResults);
            suggestions = suggestions.concat(actionItems);
            return suggestions;
        }

        // if (declarationInfo.userWantsRouteParams()) {
        //     let currentActionResult = declarationInfo.getCurrentActionResult();
        //     if (!currentActionResult.routeParams) return suggestions
        //     let routeItems = declarationInfo.convertRouteParamsToCompletionItems(currentActionResult.routeParams);
        //     suggestions = suggestions.concat(routeItems);
        //     return suggestions;
        // }

        return suggestions;
    }

}
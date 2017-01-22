'use strict';

import { 
    CompletionItem,
    Position, TextDocument
} from 'vscode-languageserver';

import DeclarationInfo from './declarationInfo';

export class ModelParser {

    static getCompletionItems(position: Position, document: TextDocument, workspaceRoot: string): CompletionItem[] {

        let declarationInfo = new DeclarationInfo(position, document, workspaceRoot)
        let userWantsSuggestions = declarationInfo.userWantsProperties();
        if (!userWantsSuggestions) return new Array<CompletionItem>();

        let model = declarationInfo.getCurrentModel();

        if (!model) return new Array<CompletionItem>();

        let namespaces = declarationInfo.getNamespaces();

        let properties = declarationInfo.getProperties(model, namespaces);

        if (!properties) return new Array<CompletionItem>();
        
        let suggestions = new Array<CompletionItem>();
        let items = declarationInfo.convertPropertiesToCompletionItems(properties);
        suggestions = suggestions.concat(items);
        return suggestions;

    }

    static getHoverResult(position: Position, document: TextDocument, workspaceRoot: string) {

        let declarationInfo = new DeclarationInfo(position, document, workspaceRoot);

        let userWantsSingleProperty = declarationInfo.userWantsSingleProperty();

        if (!userWantsSingleProperty) return;

        let model = declarationInfo.getCurrentModel();

        if (!model) return;

        let namespaces = declarationInfo.getNamespaces();

        let properties = declarationInfo.getProperties(model, namespaces);

        if (!properties) return;
        let word = declarationInfo.getWordAtPosition();
        properties = properties.filter(p => { return word.split('.')[1] === p.name })
        if (!properties) return;
        let hover = declarationInfo.convertPropertiesToHoverResult(properties[0]);
        return hover;

    }

}
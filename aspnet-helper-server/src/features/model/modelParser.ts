'use strict';

import { 
    CompletionItem, Diagnostic,
    DiagnosticSeverity, Hover,
    Position, TextDocument
} from 'vscode-languageserver';

import DeclarationInfo from './declarationInfo';

export class ModelParser {

    static getCompletionItems(position: Position, document: TextDocument, workspaceRoot: string): CompletionItem[] {

        let declarationInfo = new DeclarationInfo(document, workspaceRoot, position)
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

    static getHoverResult(position: Position, document: TextDocument, workspaceRoot: string): Hover | undefined {

        let declarationInfo = new DeclarationInfo(document, workspaceRoot, position);

        let userWantsSingleProperty = declarationInfo.userWantsSingleProperty();
        if (!userWantsSingleProperty) return;

        let model = declarationInfo.getCurrentModel();

        if (!model) return;
        let namespaces = declarationInfo.getNamespaces();

        if (!model || !namespaces) return
        let properties = declarationInfo.getProperties(model, namespaces);

        if (!properties) return;
        let word = declarationInfo.getWordAtPosition();
        properties = properties.filter(p => { return word.split('.')[1] === p.name })
        if (!properties) return;
        
        let hover = declarationInfo.convertPropertiesToHoverResult(properties[0]);
        return hover;

    }

    static getModelErrors(document: TextDocument, workspaceRoot: string): Diagnostic[] | undefined {

        let declarationInfo = new DeclarationInfo(document, workspaceRoot);

        let model = declarationInfo.getCurrentModel();

        if (!model) return;

        let namespaces = declarationInfo.getNamespaces();

        let properties = declarationInfo.getProperties(model, namespaces);
        if (!properties) return;
        
        let usedProperties = declarationInfo.getAllUsedPropertiesInFile();
        if (!usedProperties) return;

        let diagnostics: Diagnostic[] = [];

        usedProperties.forEach(u => {
            let isOkay = properties.find(p => { return p.name === u.property });

            if (!isOkay) {
                let error: Diagnostic = {
                    message: u.property + ' is not a property of ' + model,
                    severity: DiagnosticSeverity.Error,
                    source: 'ASP.NET Helper',
                    range: u.range
                }
                diagnostics.push(error);
            }

        });

        return diagnostics;
    }

}
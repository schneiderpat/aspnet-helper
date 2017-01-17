'use strict';

import * as vscode from 'vscode';
import CompletionItemProvider from './provider/completionItemProvider';
import TagHelperParser from './provider/razor/tagHelperParser';
import ModelParser from './provider/razor/modelParser';

export function activate(context: vscode.ExtensionContext) {

    let tagHelperProvider = new CompletionItemProvider(new TagHelperParser());
    let modelProvider = new CompletionItemProvider(new ModelParser());
    vscode.languages.registerCompletionItemProvider('razor', tagHelperProvider);
    vscode.languages.registerCompletionItemProvider('razor', modelProvider);

}

export function deactivate() {
}
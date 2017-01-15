'use strict';

import * as vscode from 'vscode';
import ItemProvider from './provider/itemProvider';
import TagHelperParser from './provider/razor/tagHelperParser';
import ModelParser from './provider/razor/modelParser';

export function activate(context: vscode.ExtensionContext) {

    let tagHelperProvider = new ItemProvider(new TagHelperParser());
    let modelProvider = new ItemProvider(new ModelParser());
    vscode.languages.registerCompletionItemProvider('razor', tagHelperProvider);
    vscode.languages.registerCompletionItemProvider('razor', modelProvider);

}

export function deactivate() {
}
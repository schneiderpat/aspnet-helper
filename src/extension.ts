'use strict';

import * as vscode from 'vscode';
import ItemProvider from './provider/itemProvider';
import RazorParser from './provider/razor/razorParser';

export function activate(context: vscode.ExtensionContext) {

    let itemProvider = new ItemProvider(new RazorParser());
    vscode.languages.registerCompletionItemProvider('razor', itemProvider);

}

export function deactivate() {
}
'use strict';

import * as vscode from 'vscode';
import ItemProvider from './provider/itemProvider';
import HtmlParser from './provider/html/htmlParser';

export function activate(context: vscode.ExtensionContext) {

    let itemProvider = new ItemProvider(new HtmlParser());
    vscode.languages.registerCompletionItemProvider('html', itemProvider);

}

export function deactivate() {
}
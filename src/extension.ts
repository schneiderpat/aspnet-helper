'use strict';

import * as vscode from 'vscode';
import CompletionItemProvider from './provider/completionItemProvider';
import HoverProvider from './provider/hoverProvider';
import TagHelperParser from './provider/razor/tagHelperParser';
import ModelParser from './provider/razor/modelParser';

export function activate(context: vscode.ExtensionContext) {

    let tagHelperCompletionItemProvider = new CompletionItemProvider(new TagHelperParser());
    let modelCompletionItemProvider = new CompletionItemProvider(new ModelParser());
    vscode.languages.registerCompletionItemProvider('razor', tagHelperCompletionItemProvider);
    vscode.languages.registerCompletionItemProvider('razor', modelCompletionItemProvider);

    let modelHoverProvider = new HoverProvider(new ModelParser());
    vscode.languages.registerHoverProvider('razor', modelHoverProvider);

}

export function deactivate() {
}
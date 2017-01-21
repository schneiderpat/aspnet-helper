'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import CompletionItemProvider from './provider/completionItemProvider';
import HoverProvider from './provider/hoverProvider';
import TagHelperParser from './provider/razor/tagHelperParser';
import ModelParser from './provider/razor/modelParser';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, RequestType, TransportKind } from 'vscode-languageclient';

export function activate(context: vscode.ExtensionContext) {

    // let tagHelperCompletionItemProvider = new CompletionItemProvider(new TagHelperParser());
    let modelCompletionItemProvider = new CompletionItemProvider(new ModelParser());
    // vscode.languages.registerCompletionItemProvider('razor', tagHelperCompletionItemProvider, '"');
    vscode.languages.registerCompletionItemProvider('razor', modelCompletionItemProvider, '.');

    let modelHoverProvider = new HoverProvider(new ModelParser());
    vscode.languages.registerHoverProvider('razor', modelHoverProvider);

    let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
    let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions } 
    };
    let clientOptions: LanguageClientOptions = {
        documentSelector: ['razor'],
        synchronize: {
            configurationSection: 'razorServer',
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    let disposable = new LanguageClient('razorServer', 'Razor Linter', serverOptions, clientOptions).start();
    context.subscriptions.push(disposable);
}

export function deactivate() {
}
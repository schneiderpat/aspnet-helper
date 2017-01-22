'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, RequestType, TransportKind } from 'vscode-languageclient';

export function activate(context: vscode.ExtensionContext) {

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
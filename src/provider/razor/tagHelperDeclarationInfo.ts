import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export default class TagHelperDeclarationInfo {

    private _input: string;

    constructor(input: string) {
        this._input = input;
    }
    
    // Add areas
    public testForArea(): vscode.CompletionList {
        let areaTest = /.*asp-area=".?/;
        if (!areaTest.test(this._input))
            return new vscode.CompletionList();

        let areas = new vscode.CompletionList();
        let directories = this.getDirectories();
        directories.forEach((d) => {
            areas.items.push(new vscode.CompletionItem(d));
        });
        return areas;
    }

    private getDirectories(): string[] {
        let rootDir = vscode.workspace.rootPath + path.sep + 'Areas' + path.sep;
        let directories = fs.readdirSync(rootDir).filter((file) => {
            return fs.statSync(path.join(rootDir, file)).isDirectory();
        });
        return directories;
    }

    // Add controllers
    public testForController(): vscode.CompletionList {
        let controllerTest = /.*asp-controller=".?/;
        if (!controllerTest.test(this._input))
            return new vscode.CompletionList();

        let projectPath = vscode.workspace.rootPath;
        let pattern: string;
        let area = this.getSpecificPart(this._input, this.currentAreaRegExp);
        let files = this.getControllerFiles(area);
        
        let controllers = new vscode.CompletionList();
        files.forEach((f) => { 
            let item = new vscode.CompletionItem(this.getSpecificPart(f, this.controllerNameRegExp));
            item.kind = vscode.CompletionItemKind.Class;
            controllers.items.push(item); 
        });

        return controllers;
    }

    private getControllerFiles(area?: string): string[] {
        let rootDir = vscode.workspace.rootPath;
        if (area) {
            rootDir += path.sep + 'Areas' + path.sep + area + path.sep + "Controllers" + path.sep;
        } else {
            rootDir += path.sep + "Controllers" + path.sep;
        }

        return fs.readdirSync(rootDir).filter((file) => {
            return fs.statSync(path.join(rootDir, file)).isFile();
        });
    }

    // Add actions
    public testForAction(): vscode.CompletionList {
        let actionTest = /.*asp-action=".?/;
        if (!actionTest.test(this._input))
            return new vscode.CompletionList;
        
        let actions = new vscode.CompletionList;

        let actionNames = this.getActionMethods();
        actionNames.forEach((a) => {
            let item = new vscode.CompletionItem(a);
            let routeParams = this.getCurrentActionMethodRouteParams(a);
            if (routeParams.items.length > 0) {
                item.documentation = 'Found route parameters:\n';
                let currentPosition = vscode.window.activeTextEditor.selection.active;
                let position = new vscode.Position(currentPosition.line, currentPosition.character + 1);
                let textEdit = ' ';
                routeParams.items.forEach((r) => {
                    item.documentation += r.label + '\n';
                    textEdit += r.label + '="" ';
                });
                item.additionalTextEdits = new Array<vscode.TextEdit>();
                item.additionalTextEdits.push(new vscode.TextEdit(new vscode.Range(position, position), textEdit));
                item.kind = vscode.CompletionItemKind.Method;
            }
            actions.items.push(item);
        });

        return actions;
    }

    private getControllerPath(): string {
        let rootDir = vscode.workspace.rootPath;
        let area = this.getSpecificPart(this._input, this.currentAreaRegExp);
        let controller = this.getSpecificPart(this._input, this.currentControllerRegExp);
        if (area !== '') {
            return rootDir + path.sep + 'Areas' + path.sep + area + path.sep + 'Controllers' + path.sep + controller + 'Controller.cs';
        } else {
            return rootDir + path.sep + 'Controllers' + path.sep + controller + 'Controller.cs';
        }
    }

    private asyncActionsRegExp = /\[HttpGet\]\r\n\s*public\sasync\sTask<[a-zA-Z]+>\s[a-zA-Z]+\(.*\)/g;
    private syncActionsRegExp = /\[HttpGet\]\r\n\s*public\s[a-zA-Z]+\s[a-zA-Z]+\(.*\)/g;
    private getActionMethods(): string[] {
        let pattern = this.getControllerPath();
        let file = fs.readFileSync(pattern, 'utf8');
        
        let actions: string[] = [];

        let asyncActions = file.match(this.asyncActionsRegExp);
        if (asyncActions) {
            asyncActions.forEach((a) => {
                actions.push(this.getSpecificPart(a, this.actionNameRegExp));
            });
        }

        let syncActions = file.match(this.syncActionsRegExp);
        if (syncActions) {
            syncActions.forEach((a) => {
                actions.push(this.getSpecificPart(a, this.actionNameRegExp));
            });
        }

        return actions;

    }

    // Add route params
    public testForRouteParams(): vscode.CompletionList {
        let routeParamsTest = /.*asp-route-.?/;
        if (!routeParamsTest.test(this._input))
            return new vscode.CompletionList();

        return this.getCurrentActionMethodRouteParams();
    }

    private getCurrentActionMethodRouteParams(action?: string): vscode.CompletionList {
        let pattern = this.getControllerPath();
        if (!action) action = this.getSpecificPart(this._input, this.currentActionRegExp);
        let file = fs.readFileSync(pattern, 'utf8');

        let routeParams = new vscode.CompletionList();

        let asyncActionRegExp = new RegExp('\\[HttpGet\\]\r\n\\s*public\\sasync\\sTask<[a-zA-Z]+>\\s' + action + '\\(.*\\)', 'g');
        let asyncActions = file.match(asyncActionRegExp);
        if (asyncActions) routeParams.items = routeParams.items.concat(this.extractRouteParams(asyncActions));

        let syncActionRegExp = new RegExp('\\[HttpGet\\]\r\n\\s*public\\s[a-zA-Z]+\\s' + action + '\\(.*\\)', 'g');
        let syncActions = file.match(syncActionRegExp);
        if (syncActions) routeParams.items = routeParams.items.concat(this.extractRouteParams(syncActions));

        return routeParams;
    }

    private extractRouteParams(actionMethods: RegExpMatchArray): vscode.CompletionItem[] {
        let nameRegExp = /.?\s[a-zA-Z]+\((.*)\)/;
        let routeParams = new Array<vscode.CompletionItem>();
        actionMethods.forEach((a) => {
            let completeParams = nameRegExp.exec(a);
            if (completeParams[1]) {
                completeParams[1].split(', ').forEach(param => {
                    let item = new vscode.CompletionItem('asp-route-' + param.split(' ')[1]);
                    item.kind = vscode.CompletionItemKind.Variable;
                    item.insertText = this.createRouteSnippet(param.split(' ')[1]);
                    routeParams.push(item);
                })
            }
        });
        return routeParams;
    }

    // Get specfic part of a text
    private currentAreaRegExp: RegExp = /.*asp-area="([a-zA-Z]+)".?/;
    private currentControllerRegExp: RegExp = /.*asp-controller="([a-zA-Z]+)".?/;
    private currentActionRegExp: RegExp = /.*asp-action="([a-zA-Z]+)".?/;
    private controllerNameRegExp = /([a-zA-Z]+)Controller\.cs/;
    private actionNameRegExp = /.?\s([a-zA-Z]+)\(.*\)/;

    private getSpecificPart(text: string, regExp: RegExp, part: number = 1): string {
        if (!regExp.test(text)) return ''
        return regExp.exec(text)[part];
    }

    private createRouteSnippet(param: string): vscode.SnippetString {
        return new vscode.SnippetString(param + "=\"$1\"$0");    
    }

}
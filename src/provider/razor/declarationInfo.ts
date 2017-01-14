import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export default class DeclarationInfo {
    
    // Add areas
    public testForArea(input: string): vscode.CompletionList {
        let areaTest = /.*asp-area=".?/;
        if (!areaTest.test(input))
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
    public testForController(input: string): vscode.CompletionList {
        let controllerTest = /.*asp-controller=".?/;
        if (!controllerTest.test(input))
            return new vscode.CompletionList();

        let projectPath = vscode.workspace.rootPath;
        let pattern: string;
        let area = this.getCurrentInput(input, this.areaRegExp);
        let files = this.getControllerFiles(area);
        
        let controllers = new vscode.CompletionList();
        files.forEach((f) => { controllers.items.push(new vscode.CompletionItem(this.extractController(f))); });

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

    private extractController(file: string): string {
        let regExp = /([a-zA-Z]+)Controller\.cs/;
        let results = regExp.exec(file);
        return results[1];
    }

    // Add actions
    public testForAction(input: string): vscode.CompletionList {
        let actionTest = /.*asp-action=".?/;
        if (!actionTest.test(input))
            return new vscode.CompletionList;
        
        let actions = new vscode.CompletionList;

        let actionNames = this.getActionMethods(input);
        actionNames.forEach((a) => {
            actions.items.push(new vscode.CompletionItem(a));
        });

        return actions;
    }

    private getControllerPath(input: string): string {
        let rootDir = vscode.workspace.rootPath;
        let area = this.getCurrentInput(input, this.areaRegExp);
        let controller = this.getCurrentInput(input, this.controllerRegExp);
        if (area !== '') {
            return rootDir + path.sep + 'Areas' + path.sep + area + path.sep + 'Controllers' + path.sep + controller + 'Controller.cs';
        } else {
            return rootDir + path.sep + 'Controllers' + path.sep + controller + 'Controller.cs';
        }
    }

    private getActionMethods(input: string): string[] {
        let pattern = this.getControllerPath(input);
        let file = fs.readFileSync(pattern, 'utf8');
        
        let actions: string[] = [];

        let asyncActions = file.match(this.asyncActionsRegExp);
        if (asyncActions) actions = actions.concat(this.extractActionNames(asyncActions));

        let syncActions = file.match(this.syncActionsRegExp);
        if (syncActions) actions = actions.concat(this.extractActionNames(syncActions));

        return actions;

    }

    private asyncActionsRegExp = /\[HttpGet\]\r\n\s*public\sasync\sTask<[a-zA-Z]+>\s[a-zA-Z]+\(.*\)/g;
    private syncActionsRegExp = /\[HttpGet\]\r\n\s*public\s[a-zA-Z]+\s[a-zA-Z]+\(.*\)/g;
    private extractActionNames(actionMethods: RegExpMatchArray): string[]
    {
        let nameRegExp = /.?\s([a-zA-Z]+)\(.*\)/;
        let actions: string[] = [];
        actionMethods.forEach((a) => {
            let name = nameRegExp.exec(a);
            if (name) actions.push(name[1]);
        })
        return actions;
    }

    // Add route params
    public testForRouteParams(input: string): vscode.CompletionList {
        let routeParamsTest = /.*asp-route-.?/;
        if (!routeParamsTest.test(input))
            return new vscode.CompletionList();

        return this.getCurrentActionMethodRouteParams(input);
    }

    private getCurrentActionMethodRouteParams(input: string): vscode.CompletionList {
        let pattern = this.getControllerPath(input);
        let action = this.getCurrentInput(input, this.actionRegExp);
        let file = fs.readFileSync(pattern, 'utf8');

        let routeParams = new vscode.CompletionList();
        let nameRegExp = /.?\s[a-zA-Z]+\((.*)\)/;

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
                    item.insertText = this.createRouteSnippet(param.split(' ')[1]);
                    routeParams.push(item);
                })
            }
        });
        return routeParams;
    }

    // Get currently typed params
    private areaRegExp: RegExp = /.*asp-area="([a-zA-Z]+)".?/;
    private controllerRegExp: RegExp = /.*asp-controller="([a-zA-Z]+)".?/;
    private actionRegExp: RegExp = /.*asp-action="([a-zA-Z]+)".?/;

    private getCurrentInput(input: string, regExp: RegExp): string {
        if (!regExp.test(input)) return ''

        return regExp.exec(input)[1];
    }

    private createRouteSnippet(param: string): vscode.SnippetString {
        return new vscode.SnippetString(param + "=\"$1\"$0");    
    }

}
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export default class DeclarationInfo {
    
    // Add areas
    public testForArea(input: string): string[] {
        let areaTest = /.*asp-area=".?/;
        if (!areaTest.test(input))
            return [];

        return this.getDirectories();
    }

    private getDirectories(): string[] {
        let rootDir = vscode.workspace.rootPath + path.sep + 'Areas' + path.sep;
        return fs.readdirSync(rootDir).filter((file) => {
            return fs.statSync(path.join(rootDir, file)).isDirectory();
        });
    }

    // Add controllers
    public testForController(input: string): string[] {
        let controllerTest = /.*asp-controller=".?/;
        if (!controllerTest.test(input))
            return [];

        let projectPath = vscode.workspace.rootPath;
        let pattern: string;
        let area = this.getCurrentArea(input);
        let files = this.getControllerFiles(area);
        
        let controllers: string[] = [];
        files.forEach((f) => { controllers.push(this.extractController(f)); });

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
    public testForAction(input: string): string[] {
        let actionTest = /.*asp-action=".?/;
        if (!actionTest.test(input))
            return [];

        let pattern = this.getControllerPath(input);
        
        let actions: string[] = [];

        let file = fs.readFileSync(pattern, 'utf8');

        actions = this.getActionMethods(file);

        return actions;
    }

    private getControllerPath(input: string): string {
        let rootDir = vscode.workspace.rootPath;
        let area = this.getCurrentArea(input);
        let controller = this.getCurrentController(input);
        if (area !== '') {
            return rootDir + path.sep + 'Areas' + path.sep + area + path.sep + 'Controllers' + path.sep + controller + 'Controller.cs';
        } else {
            return rootDir + path.sep + 'Controllers' + path.sep + controller + 'Controller.cs';
        }
    }

    private getActionMethods(file: string): string[] {
        
        let actions: string[] = [];

        let asyncActionsRegExp = /\[HttpGet\]\r\n\s*public\sasync\sTask<[a-zA-Z]+>\s[a-zA-Z]+\(.*\)/g;
        let asyncActions = file.match(asyncActionsRegExp);
        if (asyncActions) actions = actions.concat(this.extractActionNames(asyncActions));

        let syncActionsRegExp = /\[HttpGet\]\r\n\s*public\s[a-zA-Z]+\s[a-zA-Z]+\(.*\)/g;
        let syncActions = file.match(syncActionsRegExp);
        if (syncActions) actions = actions.concat(this.extractActionNames(syncActions));

        return actions;

    }

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
    public testForRouteParams(input: string): string[] {
        let routeParamsTest = /.*asp-route-.?/;
        if (!routeParamsTest.test(input))
            return [];

        let pattern = this.getControllerPath(input);
        let action = this.getCurrentAction(input);
        let file = fs.readFileSync(pattern, 'utf8');
        return this.getCurrentActionMethodRouteParams(file, action);
    }

    private getCurrentActionMethodRouteParams(file: string, action: string): string[] {
        let routeParams: string[] = [];
        let nameRegExp = /.?\s[a-zA-Z]+\((.*)\)/;

        let asyncActionRegExp = new RegExp('\\[HttpGet\\]\r\n\\s*public\\sasync\\sTask<[a-zA-Z]+>\\s' + action + '\\(.*\\)', 'g');
        let asyncActions = file.match(asyncActionRegExp);
        if (asyncActions) routeParams = routeParams.concat(this.extractRouteParams(asyncActions));

        let syncActionRegExp = new RegExp('\\[HttpGet\\]\r\n\\s*public\\s[a-zA-Z]+\\s' + action + '\\(.*\\)', 'g');
        let syncActions = file.match(syncActionRegExp);
        if (syncActions) routeParams = routeParams.concat(this.extractRouteParams(syncActions));

        return routeParams;
    }

    private extractRouteParams(actionMethods: RegExpMatchArray): string[] {
        let nameRegExp = /.?\s[a-zA-Z]+\((.*)\)/;
        let routeParams: string[] = [];
        actionMethods.forEach((a) => {
            let completeParams = nameRegExp.exec(a);
            if (completeParams[1]) {
                completeParams[1].split(', ').forEach(param => {
                    routeParams.push('asp-route-' + param.split(' ')[1] + '=""');
                })
            }
        });
        return routeParams;
    }

    // Get currently typed params
    private getCurrentArea(input: string): string {
        let areaTest = /.*asp-area="([a-zA-Z]+)".?/;
        if (!areaTest.test(input))
            return '';

        let areas = areaTest.exec(input);
        return areas[1];
    }

    private getCurrentController(input: string): string {
        let controllerTest = /.*asp-controller="([a-zA-Z]+)".?/;
        if (!controllerTest.test(input))
            return '';

        let controllers = controllerTest.exec(input);
        return controllers[1];
    }

    private getCurrentAction(input: string): string {
        let actionTest = /.*asp-action="([a-zA-Z]+)".?/;
        if (!actionTest.test(input))
            return '';

        let actions = actionTest.exec(input);
        return actions[1];
    }

}
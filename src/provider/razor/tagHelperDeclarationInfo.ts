import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { ActionResult, RouteParameter, GetParts } from '../parsingResults';

export default class TagHelperDeclarationInfo {

    private _document: vscode.TextDocument;
    private _input: string;
    private _rootDir: string;

    constructor(input: string, document: vscode.TextDocument) {
        this._input = input;
        this._document = document;
        this.getRootPath();
    }

    private getRootPath() {
        let currentDir = this._document.uri.fsPath;

        while (currentDir !== vscode.workspace.rootPath) {
            currentDir = path.dirname(currentDir);
            fs.readdirSync(currentDir).forEach(f => {
                if (f.includes('project.json') || f.includes('csproj')) {
                    this._rootDir = currentDir;
                    return;
                } 
            });
        }
    }
    
    // ----------------------------------------------------------------------------------

    public userWantsAreas(): boolean {
        let areaTest = /.*asp-area="[a-zA-Z]*$/;
        if (areaTest.test(this._input)) return true
        return false
    }

    public getAreaNames(): string[] {
        let areaNames: string[] = [];
        let directories = this.getAreaDirectories();
        directories.forEach((d) => { areaNames.push(d) });
        return areaNames;
    }

    public convertAreaNamesToCompletionItems(areas: string[]): vscode.CompletionItem[] {
        let items = new Array<vscode.CompletionItem>();
        areas.forEach(a => {
            let item = new vscode.CompletionItem(a);
            items.push(item);
        });
        return items;
    }

    private getAreaDirectories(): string[] {
        let areaDir = this._rootDir + path.sep + 'Areas' + path.sep;
        let directories = fs.readdirSync(areaDir).filter((file) => {
            return fs.statSync(path.join(areaDir, file)).isDirectory();
        });
        return directories;
    }

    // ----------------------------------------------------------------------------------

    public userWantsControllers(): boolean {
        let controllerTest = /.*asp-controller="[a-zA-Z]*$/
        if (controllerTest.test(this._input)) return true;
        return false;
    }

    public getControllerNames(): string[] {
        let area = this.getSpecificPart(this._input, this.currentAreaRegExp);
        let files = this.getControllerFiles(area);

        let controllerNames: string[] = [];
        files.forEach((f) => { 
            let controllerName = this.getSpecificPart(f, this.controllerNameRegExp);
            controllerNames.push(controllerName); 
        });
        return controllerNames;
    }

    public convertControllerNamesToCompletionItems(controllers: string[]): vscode.CompletionItem[] {
        let items = new Array<vscode.CompletionItem>();
        controllers.forEach(c => {
            let item = new vscode.CompletionItem(c);
            item.kind = vscode.CompletionItemKind.Class;
            items.push(item);
        });
        return items;
    }

    private getControllerFiles(area?: string): string[] {
        let pattern = this._rootDir + path.sep;
        if (area) {
            pattern += 'Areas' + path.sep + area + path.sep + "Controllers" + path.sep + '*Controller.cs';
        } else {
            pattern += "Controllers" + path.sep + path.sep + '*Controller.cs';
        }
        let files = glob.sync(pattern);
        if (files) return files
    }

    // ----------------------------------------------------------------------------------

    private _asyncActionsRegExp = /\[HttpGet\]\r\n\s*public\sasync\sTask<([a-zA-Z]*<?[a-zA-Z]+>?)>\s([a-zA-Z]+)\((.*)\)/g;
    private _syncActionsRegExp = /\[HttpGet\]\r\n\s*public\s([a-zA-Z]*<?[a-zA-Z]+>?)\s([a-zA-Z]+)\((.*)\)/g;
    public userWantsActions(): boolean {
        let actionTest = /.*asp-action="[a-zA-Z]*$/
        if (actionTest.test(this._input)) return true
        return false
    }

    public getActionResults(): ActionResult[] {
        let actionResults = new Array<ActionResult>();
        let actionMethods = this.getActionMethods();
        actionMethods.forEach(a => {
            let item = new ActionResult(a);
            actionResults.push(item);
        })

        return actionResults;

    }

    private getControllerPath(): string {
        let pattern = this._rootDir + path.sep;
        let area = GetParts(this._input, this.currentAreaRegExp);
        let controller = GetParts(this._input, this.currentControllerRegExp);
        // TODO: Add action only routing
        if (!area && !controller) return '';
        if (area) {
            return pattern + 'Areas' + path.sep + area[1] + path.sep + 'Controllers' + path.sep + controller + 'Controller.cs';
        } else {
            return pattern + 'Controllers' + path.sep + controller[1] + 'Controller.cs';
        }
    }
    
    private getActionMethods(): string[] {
        let pattern = this.getControllerPath();
        if (!pattern) return [];
        let file = fs.readFileSync(pattern, 'utf8');
        let actions: string[] = [];
        
        let asyncActions = file.match(this._asyncActionsRegExp);
        if (asyncActions) asyncActions.forEach((a) => { actions.push(a) })
        
        let syncActions = file.match(this._syncActionsRegExp);
        if (syncActions) syncActions.forEach((a) => { actions.push(a) })

        return actions;
    }

    public convertActionResultToCompletionItems(actionResults: ActionResult[]): vscode.CompletionItem[] {
        let items = new Array<vscode.CompletionItem>();
        actionResults.forEach(a => {
            let item = new vscode.CompletionItem(a.name);
            item.kind = vscode.CompletionItemKind.Method;
            item.detail = a.type;
            if (a.routeParams) {
                item.documentation = 'Found route parameter:\n';
                let currentPosition = vscode.window.activeTextEditor.selection.active;
                let position = new vscode.Position(currentPosition.line, currentPosition.character + 1);
                let textEdit = ' ';
                a.routeParams.forEach((r) => {
                    item.documentation += r.type + ' ' + r.name + '\n';
                    textEdit += 'asp-route-' + r.name + '="" ';
                });
                item.additionalTextEdits = new Array<vscode.TextEdit>();
                item.additionalTextEdits.push(new vscode.TextEdit(new vscode.Range(position, position), textEdit));
            }
            items.push(item);
        })
        return items;
    }

    // ----------------------------------------------------------------------------------

    public userWantsRouteParams(): boolean {
        let routeParamsTest = /.*asp-route-[a-zA-Z]*$/;
        if (routeParamsTest.test(this._input)) return true
        return false
    }

    public getCurrentActionResult(): ActionResult {
        let action = this.getCurrentAction();
        if (!action) return new ActionResult();

        let actionResults = this.getActionResults().filter(a => { return (a.name === action) });
        if (!actionResults) return new ActionResult();
        if (actionResults.length > 1) return new ActionResult();
        return actionResults[0];
    }

    public convertRouteParamsToCompletionItems(routeParams: RouteParameter[]): vscode.CompletionItem[] {
        let items = new Array<vscode.CompletionItem>();
        routeParams.forEach(r => {
            let item = new vscode.CompletionItem('asp-route-' + r.name);
            item.insertText = this.createRouteSnippet(r.name);
            item.kind = vscode.CompletionItemKind.Variable;
            item.detail = r.type;
            items.push(item);
        });
        return items;
    }

    public getCurrentAction(): string {
        let actionTest = /asp-action="([a-zA-Z]+)"/;
        let action = GetParts(this._input, actionTest);
        if (!action) return '';
        return action[1];
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
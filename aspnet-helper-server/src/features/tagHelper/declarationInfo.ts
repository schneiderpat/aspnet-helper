import {
    CompletionItem, CompletionItemKind,
    Files,
    Position, Range, 
    TextDocument, TextEdit,
    TextDocumentPositionParams
} from 'vscode-languageserver';
import Uri from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

import { 
    ActionResult, Property, GetParts 
} from '../parsingResults';

export default class TagHelperDeclarationInfo {

    private _document: TextDocument
    private _input: string;
    private _rootDir: string;
    private _position: Position;

    constructor(position: Position, document: TextDocument, workspaceRoot: string) {
        this._document = document;
        this._position = position;
        this.getRootPath();
        this.setInput();
    }

    private setInput() {
        let lines = this._document.getText().split(/\r?\n/g);
        this._input = lines[this._position.line].substr(0, this._position.character);
    }

    private getRootPath() {
        let currentDir = Files.uriToFilePath(this._document.uri);

        while (currentDir !== this._rootDir) {
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
        let areaTest = /.*asp-area="\w*$/;
        if (areaTest.test(this._input)) return true
        return false
    }

    public getAreaNames(): string[] {
        let areaNames: string[] = [];
        let directories = this.getAreaDirectories();
        directories.forEach((d) => { areaNames.push(d) });
        return areaNames;
    }

    public convertAreaNamesToCompletionItems(areas: string[]): CompletionItem[] {
        let items = new Array<CompletionItem>();
        areas.forEach(a => {
            let item = CompletionItem.create(a);
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
        let controllerTest = /.*asp-controller="\w*$/
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

    public convertControllerNamesToCompletionItems(controllers: string[]): CompletionItem[] {
        let items = new Array<CompletionItem>();
        controllers.forEach(c => {
            let item = CompletionItem.create(c);
            item.kind = CompletionItemKind.Class;
            items.push(item);
        });
        return items;
    }

    private getControllerFiles(area?: string): string[] {
        let pattern = this._rootDir + path.sep;
        if (area) {
            pattern += 'Areas' + path.sep + area + path.sep + "Controllers" + path.sep + '*Controller.cs';
        } else {
            pattern += "Controllers" + path.sep + '*Controller.cs';
        }
        let files = glob.sync(pattern);
        if (files) return files
    }

    // ----------------------------------------------------------------------------------

    private _asyncActionsRegExp = /\[HttpGet\]\r\n\s*public\sasync\sTask<(\w*<?\w+>?)>\s(\w+)\((.*)\)/g;
    private _syncActionsRegExp = /\[HttpGet\]\r\n\s*public\s(\w*<?\w+>?)\s(\w+)\((.*)\)/g;
    public userWantsActions(): boolean {
        let actionTest = /.*asp-action="\w*$/
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
        let controllerName: string;
        if (controller) controllerName = controller[1];
        if (!controller) controllerName = this.getCurrentController();

        // TODO: Add action only routing
        if (!area && !controllerName) return '';
        if (area) {
            return pattern + 'Areas' + path.sep + area[1] + path.sep + 'Controllers' + path.sep + controllerName + 'Controller.cs';
        } else {
            return pattern + 'Controllers' + path.sep + controllerName + 'Controller.cs';
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

    public convertActionResultToCompletionItems(actionResults: ActionResult[]): CompletionItem[] {
        let items = new Array<CompletionItem>();
        actionResults.forEach(a => {
            let item = CompletionItem.create(a.name);
            item.kind = CompletionItemKind.Method;
            item.detail = a.type;
            if (a.routeParams) {
                item.documentation = 'Found route parameter:\n';
                let position = Position.create(this._position.line, this._position.character + 1);
                let newText = ' ';
                a.routeParams.forEach((r) => {
                    item.documentation += r.type + ' ' + r.name + '\n';
                    newText += 'asp-route-' + r.name + '="" ';
                });
                item.additionalTextEdits = new Array<TextEdit>();
                let textEdit = TextEdit.insert(position, newText);
                item.additionalTextEdits.push(textEdit);
            }
            items.push(item);
        })
        return items;
    }

    public getCurrentController(): string {
        let folderNameRegExp = new RegExp('.*\\' + path.sep + '(\w+)$');
        let name = folderNameRegExp.exec(path.dirname(Files.uriToFilePath(this._document.uri)));
        if (name) return name[1]
        return '';
    }

    // ----------------------------------------------------------------------------------

    public userWantsRouteParams(): boolean {
        let routeParamsTest = /.*asp-route-\w*$/;
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

    // public convertRouteParamsToCompletionItems(routeParams: Property[]): CompletionItem[] {
    //     let items = new Array<CompletionItem>();
    //     routeParams.forEach(r => {
    //         let item: CompletionItem = {
    //             label: 'asp-route-' + r.name,
    //             insertText: this.createRouteSnippet(r.name),
    //             kind: CompletionItemKind.Variable,
    //             detail: r.type
    //         }
    //         items.push(item);
    //     });
    //     return items;
    // }

    public getCurrentAction(): string {
        let actionTest = /asp-action="(\w+)"/;
        let action = GetParts(this._input, actionTest);
        if (!action) return '';
        return action[1];
    }

    // Get specfic part of a text
    private currentAreaRegExp: RegExp = /.*asp-area="(\w+)".?/;
    private currentControllerRegExp: RegExp = /.*asp-controller="(\w+)".?/;
    private currentActionRegExp: RegExp = /.*asp-action="(\w+)".?/;
    private controllerNameRegExp = /(\w+)Controller\.cs/;
    private actionNameRegExp = /.?\s(\w+)\(.*\)/;

    private getSpecificPart(text: string, regExp: RegExp, part: number = 1): string {
        if (!regExp.test(text)) return ''
        return regExp.exec(text)[part];
    }

    // private createRouteSnippet(param: string): SnippetString {
    //     return new SnippetString(param + "=\"$1\"$0");    
    // }

}
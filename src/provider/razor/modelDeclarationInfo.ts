import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export default class ModelDeclarationInfo {

    private _document: vscode.TextDocument;
    
    constructor(document: vscode.TextDocument) {
        this._document = document;
    }

    public userWantsSuggestions(input: string): boolean {
        let userRegExp = /.*@Model.$/;
        if (userRegExp.test(input)) return true;
        return false
    }

    public getCurrentModel(): string {
        let firstLine = this._document.lineAt(0).text;
        let model = this.getSpecificPart(firstLine, this.modelRegExp);
        return model;
    }

    public getNamespaces(): string[] {

        let files = this.getViewImportsFiles();
        let namespaces = this.getNamespacesFromFiles(files);
        return namespaces
    }

    private getViewImportsFiles(): string[] {
        let currentDir = this._document.uri.fsPath;
        let files: string[] = [];

        while (currentDir !== vscode.workspace.rootPath) {
            currentDir = path.dirname(currentDir);
            fs.readdirSync(currentDir).forEach(f => {
                if (f.includes('_ViewImports.cshtml')) files.push(currentDir + path.sep + f);
            });
        }

        return files;
    }

    private getNamespacesFromFiles(files: string[]): string[] {
        let namespaces: string[] = [];
        let namespaceRegExp = /@using\s(.*)/;
        files.forEach(f => {
            let text = fs.readFileSync(f, 'utf8');
            let results = text.match(namespaceRegExp);
            results.forEach(r => { 
                let namespace = this.getSpecificPart(r, namespaceRegExp);
                if (namespace) namespaces.push(namespace);
            })
        });
        return namespaces;
    }

    public getProperties(model: string, namespaces: string[]): vscode.CompletionItem[] {
        let matchingFiles: string[] = this.getMatchingFiles(model, namespaces);
        
        if (matchingFiles.length = 1) {
            let text = fs.readFileSync(matchingFiles[0], 'utf8');
            let bodyRegExp = /public\s([a-zA-Z]+<?[a-zA-Z]+>?)\s([a-zA-Z]+)/g;
            let body = text.match(bodyRegExp);
            if (body) {
                body = body.filter(f => !f.includes('class'));
                let properties = new Array<vscode.CompletionItem>();
                body.forEach(b => { 
                    let propType = this.getSpecificPart(b, this.propRegExp);
                    let propName = this.getSpecificPart(b, this.propRegExp, 2);
                    if (propType && propName) {
                        let item = new vscode.CompletionItem(propName);
                        item.kind = vscode.CompletionItemKind.Property;
                        item.detail = propType;
                        properties.push(item);
                    }
                });
                return properties;
            }
        };
        return [];
    }

    private getMatchingFiles(model: string, namespaces: string[]): string[] {
        let modelsPattern = vscode.workspace.rootPath + path.sep + '**\\Models\\**\\*.cs';
        let viewModelsPattern = vscode.workspace.rootPath + path.sep + '**\\ViewModels\\**\\*.cs';
        let files = glob.sync(modelsPattern).concat(glob.sync(viewModelsPattern));
        let matchingFiles: string[] = [];
        namespaces.forEach(n => {
            files.forEach(f => {
                if (this.isMatchingFile(model, n, f)) matchingFiles.push(f); 
            });
        });
        return matchingFiles;
    }

    private isMatchingFile(model: string, namespace: string, file: string): string {
        let text = fs.readFileSync(file, 'utf8');
        let namespaceRegExp = new RegExp('namespace\\s' + namespace);
        let classNameRegExp = new RegExp('class\\s' + model);

        if (namespaceRegExp.test(text) && classNameRegExp.test(text)) return file;

        return '';
    }

    private modelRegExp = /.?model\s(.*)$/
    private propRegExp = /public\s([a-zA-Z]+<?[a-zA-Z]+>?)\s([a-zA-Z]+)/
    private getSpecificPart(text: string, regExp: RegExp, part: number = 1): string {
        if (!regExp.test(text)) return ''
        let results = regExp.exec(text);
        return results[part];
    }

}
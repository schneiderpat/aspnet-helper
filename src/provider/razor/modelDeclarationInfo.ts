import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export default class ModelDeclarationInfo {

    public getCurrentModel(document: vscode.TextDocument): string {
        let firstLine = document.lineAt(0).text;
        let model = this.getSpecificPart(firstLine, this.modelRegExp);
        return model;
    }

    public getNamespaces(document: vscode.TextDocument): string[] {

        let files = this.getViewImportsFiles(document);
        let namespaces = this.getNamespacesFromFiles(files);
        return namespaces
    }

    private getViewImportsFiles(document: vscode.TextDocument): string[] {
        let currentDir = document.uri.fsPath;
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

    public getProperties(model: string, namespaces: string[]): string[] {
        let matchingFiles: string[] = [];
        let files = this.getModelFiles();

        namespaces.forEach(n => {
            files.forEach(f => {
                let matchingFile = this.getMatchingFiles(model, n, f);
                if (matchingFile) matchingFiles.push(matchingFile); 
            });
        });

        if (matchingFiles.length = 1) {
            let text = fs.readFileSync(matchingFiles[0], 'utf8');
            let bodyRegExp = /public\s[a-zA-Z]+\s([a-zA-Z]+)/g;
            let body = text.match(bodyRegExp);
            if (body) {
                let properties: string[] = [];
                body.forEach(b => { 
                    let prop = this.getSpecificPart(b, this.propRegExp);
                    if (prop) properties.push(prop);
                });
                return properties;
            }
        };
        return [];
    }

    private getModelFiles(): string[] {
        let modelsPattern = vscode.workspace.rootPath + path.sep + '**\\Models\\**\\*.cs';
        let viewModelsPattern = vscode.workspace.rootPath + path.sep + '**\\ViewModels\\**\\*.cs';
        let files = glob.sync(modelsPattern).concat(glob.sync(viewModelsPattern));
        return files;
    }

    private getMatchingFiles(model: string, namespace: string, file: string): string {
        let text = fs.readFileSync(file, 'utf8');
        let namespaceRegExp = new RegExp('namespace\\s' + namespace);
        let classNameRegExp = new RegExp('class\\s' + model);

        if (namespaceRegExp.test(text) && classNameRegExp.test(text)) return file;

        return '';
    }

    private modelRegExp = /.?model\s(.*)$/
    private propRegExp = /public\s[a-zA-Z]+\s([a-zA-Z]+)/
    private getSpecificPart(text: string, regExp: RegExp, part: number = 1): string {
        if (!regExp.test(text)) return ''
        let results = regExp.exec(text);
        return results[part];
    }

}
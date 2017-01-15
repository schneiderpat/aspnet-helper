import * as vscode from 'vscode';
import * as fs from 'fs';

export default class ModelDeclarationInfo {

    public getModel(document: vscode.TextDocument) {
        let firstLine = document.lineAt(0).text;
        let model = this.getSpecificPart(firstLine, this.modelRegExp);
        return model;
    }

    private modelRegExp = /.?model\s(.*)$/
    private getSpecificPart(text: string, regExp: RegExp, part: number = 1): string {
        if (!regExp.test(text)) return ''
        return regExp.exec(text)[part];
    }

}
import * as vscode from 'vscode';

interface IParser {

    getParsingResults(input: string, document?: vscode.TextDocument): vscode.CompletionList;
    getHoverResult(input: string, document?: vscode.TextDocument);

}

export default IParser;
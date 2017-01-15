import * as vscode from 'vscode';

interface IParser {

    getParsingResults(input: string, document?: vscode.TextDocument): vscode.CompletionList;

}

export default IParser;
import * as vscode from 'vscode';

interface IParser {

    getParsingResults(string): vscode.CompletionList;

}

export default IParser;
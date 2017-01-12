'use strict';

import DeclarationInfo from './declarationInfo';
import ParsingResult from '../parsingResult';
import IParser from '../iParser';

export default class HtmlParser implements IParser {

    private _declarationInfo: DeclarationInfo;

    public getParsingResult(input: string): ParsingResult {

        this._declarationInfo = new DeclarationInfo();

        let suggestions = this.getSuggestions(input);
        let userInput = this.getUserInput(input);

        return new ParsingResult(suggestions);

    }

    getSuggestions(input: string): string[] {
        let suggestions: string[] = [];

        let areas = this._declarationInfo.testForArea(input);
        areas.forEach(a => { suggestions.push(a); });

        let controllers = this._declarationInfo.testForController(input);
        if (controllers.length > 0) {
            suggestions = [];
            controllers.forEach(c => { suggestions.push(c); });
        }

        let actions = this._declarationInfo.testForAction(input);
        if (actions.length > 0)
        {
            suggestions = [];
            actions.forEach(a => { suggestions.push(a); });
        }

        let routeParams = this._declarationInfo.testForRouteParams(input);
        if (routeParams.length > 0)
        {
            suggestions = [];
            routeParams.forEach(r => { suggestions.push(r); });
        }

        return suggestions;
    }

    private getUserInput(input: string): string {
        let regExp = /"([a-zA-Z]+)$/;

        if (!regExp.test(input))
            return '';

        return regExp.exec(input)[0];
    }
}
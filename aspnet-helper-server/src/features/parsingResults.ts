'use strict';

import {
    Range
} from 'vscode-languageserver';

export class ActionResult {
    private _asyncActionsRegExp = /\[HttpGet\]\r\n\s*public\sasync\sTask<([a-zA-Z]*<?[a-zA-Z]+>?)>\s([a-zA-Z]+)\((.*)\)/;
    private _syncActionsRegExp = /\[HttpGet\]\r\n\s*public\s([a-zA-Z]*<?[a-zA-Z]+>?)\s([a-zA-Z]+)\((.*)\)/;

    constructor(actionResult?: string) {
        if (actionResult) {
            if (this._asyncActionsRegExp.test(actionResult)) this.parseActionResult(actionResult, TagHelperRegExp.Async);
            if (this._syncActionsRegExp.test(actionResult)) this.parseActionResult(actionResult, TagHelperRegExp.Sync);
        }
    }

    public name: string;
    public type: string;
    public routeParams: Property[];

    private parseActionResult(actionResult: string, type: TagHelperRegExp) {
        let parts: RegExpExecArray

        if (type === TagHelperRegExp.Async) parts = GetParts(actionResult, this._asyncActionsRegExp);
        if (type === TagHelperRegExp.Sync) parts = GetParts(actionResult, this._syncActionsRegExp);

        this.type = parts[1];
        this.name = parts[2];
        if (parts[3]) this.parseRouteParams(parts[3]);

    }

    private parseRouteParams(routeParams: string) {

        if (!this.routeParams) this.routeParams = new Array<Property>()
        routeParams.split(', ').forEach(p => {
            let param = p.split(' ');
            let item = new Property();
            item.type = param[0];
            item.name = param[1];
            this.routeParams.push(item);
        })
    }

}

export enum TagHelperRegExp {
    Async,
    Sync
}

export class Property {
    public name: string;
    public type: string;
}

export class PropertyPosition {
    public property: string;
    public range: Range;
}

export function GetParts(text: string, regExp: RegExp): RegExpExecArray {
    if (!regExp.test(text)) return null
    return regExp.exec(text);
}
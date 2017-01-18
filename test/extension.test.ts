//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import { Property, GetParts } from '../src/provider/parsingResults';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    test("Get parsing results", () => {

        let propRegExp = /public\s([a-zA-Z]*<?[a-zA-Z]+>?)\s([a-zA-Z]+)/g;
        let text = 'public string FirstName';
        let prop = new Property();
        prop.name = 'FirstName';
        prop.type = 'string';

        let regExpResult = GetParts(text, new RegExp(propRegExp.source));
        let result = new Property();
        result.name = regExpResult[2];
        result.type = regExpResult[1];

        assert.deepEqual(prop, result);

    });
    
});
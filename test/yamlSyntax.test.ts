// Typings are available but need TypeScript 2
declare var suite: any;
declare var test: any;
declare var require: any;
import YAMLException = require("../src/exception");

var assert = require('assert');
var {suite, test} = require('mocha');

import {safeLoad as loadYaml} from '../src/index'

suite('YAML Syntax', () => {

    suite('Warnings for tab symbols', () => {

        test('test 001', function () {
            testErrors(
                "schemas:\n" +
                "\tsch1:\n",
                [
                    {
                        line: 1,
                        column: 0,
                        message: "Using tabs can lead to unpredictable results",
                        isWarning: true
                    }
                ]
            );
        });

        test('test 002', function () {
            testErrors(
                "level0:\n" +
                "  level1:\n" +
                "    level2:\n" +
                "  \t  level3:\n",
                [
                    {
                        line: 3,
                        column: 2,
                        message: "Using tabs can lead to unpredictable results",
                        isWarning: true
                    }
                ]
            );
        });
    });
});


interface TestError{
    message: string
    line: number
    column: number
    isWarning:boolean
}

function testErrors(input:string,expectedErrors: TestError[]) {


    let errorsMap: {[key:string]:boolean} = {};
    for(let e of expectedErrors){
        let key = `${e.message} at line ${e.line} column ${e.column}`;
        if(e.isWarning){
            key += " (warning)";
        }
        errorsMap[key] = true;
    }

    let ast = safeLoad(input);
    if(!ast){
        assert(false,"The parser has failed to load YAML AST");
    }
    let actualErrors = ast.errors;
    if(actualErrors.length==0 && expectedErrors.length==0){
        assert(true);
        return;
    }
    let unexpectedErrorsMap: {[key:string]:YAMLException} = {};
    for(let e of actualErrors){
        let key = `${e.reason} at line ${e.mark.line} column ${e.mark.column}`;
        if(e.isWarning){
            key += " (warning)";
        }
        if(!errorsMap[key]){
            unexpectedErrorsMap[key] = e;
        }
        else{
            delete errorsMap[key];
        }
    }
    let missingErrors = Object.keys(errorsMap);
    let unexpectedErrorKeys = Object.keys(unexpectedErrorsMap);
    if(missingErrors.length==0 && unexpectedErrorKeys.length==0){
        assert(true);
        return;
    }
    let messageComponents:string[] = [];
    if(unexpectedErrorKeys.length>0) {
        messageComponents.push(`Unexpected errors:\n${unexpectedErrorKeys.join('\n')}`);
    }
    if(missingErrors.length>0){
        messageComponents.push(`Missing errors:\n${missingErrors.join('\n')}`);
    }
    let testFailureMessage = `\n${messageComponents.join("\n\n")}`;
    assert(false,testFailureMessage);
};

function safeLoad(input) {
    return loadYaml(input, {})
}
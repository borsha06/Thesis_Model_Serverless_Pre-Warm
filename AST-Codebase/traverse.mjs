// const {parse} = require("@babel/parser");
// const parser = require("@babel/parser");
// const traverse = require("@babel/traverse").default;
import * as parser from '@babel/parser';
import * as fs from 'fs';
import * as babel from '@babel/core';
import _traverse from "@babel/traverse";

const traverse = _traverse.default;

const filePath = './test.ts'; // Specify the path to your TypeScript file

const code = fs.readFileSync(filePath, 'utf-8');

// const code = "2 + (4 * 7)";
//
// const ast = parse(code);

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
});

traverse(ast, {
    enter(path){
        console.log(path);
    }
})
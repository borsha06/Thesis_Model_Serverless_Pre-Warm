
// const code = "2 + (4 * 7)";
//
// const ast = parse(code);
//
// console.log(ast.program.body[0].expression.left.value);

import * as parser from '@babel/parser';
import * as fs from 'fs';
import * as babel from '@babel/core';

const filePath = './test.ts'; // Specify the path to your TypeScript file

const code = fs.readFileSync(filePath, 'utf-8');



// function extractAWSInvocations(ast) {
//     const invocations = [];
//     const visited = new Set(); // Track visited nodes to avoid circular references
//
//     function traverse(node) {
//         if (visited.has(node)) {
//             return; // Skip already visited node to prevent loops
//         }
//         visited.add(node);
//
//         if (babel.types.isCallExpression(node)) {
//             const expression = node.callee;
//             if (babel.types.isMemberExpression(expression)) {
//                 const property = expression.property.name;
//                 if (
//                     property === 's3' ||
//                     property === 'lambda' ||
//                     property.startsWith('aws_')
//                 ) {
//                     invocations.push(property);
//                 }
//                 traverse(expression); // Traverse nested calls
//             }
//         }
//
//         // Recursively traverse children
//         babel.types.traverse(node, {
//             enter(child) {
//                 traverse(child);
//             },
//         });
//     }
//
//     traverse(ast);
//
//     return invocations;
// }

// // Parse the MJS code into an AST
// const code = `// Your MJS code here`;
// const ast = babel.parse(code, { sourceType: 'module' });

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
});

console.log(ast.program.body[5].declaration.body.body[0].body);

const astJson = JSON.parse(JSON.stringify(ast));
console.log(astJson.program);

// Define a function for depth-first traversal on the JSON representation
function traverse(node, path = []) {
    if (node && typeof node === 'object') {
        // Check conditions for AWS Lambda invocation
        if (
            node.type === 'NewExpression' &&
            node.callee &&
            node.callee.type === 'MemberExpression' &&
            node.callee.object.name === 'lambda' &&
            node.callee.property.name === 'Function'
        ) {
            console.log('Found AWS Lambda invocation');
            console.log('Path:', path.join(' -> '));
        }

        // Check conditions for S3 invocation
        if (
            node.type === 'NewExpression' &&
            node.callee &&
            node.callee.type === 'MemberExpression' &&
            node.callee.object &&
            node.callee.object.type === 'MemberExpression' &&
            node.callee.object.object.name === 's3_notifications' &&
            node.callee.object.property.name === 'LambdaDestination'
        ) {
            console.log('Found S3 Invocation');
            console.log('Path:', path.join(' -> '));
        }

        // Add additional conditions for other invocations as needed
        // For example, if there's another type of invocation, check for it here.

        // Recursively traverse child nodes
        for (const key in node) {
            if (key !== 'type' && node.hasOwnProperty(key)) {
                traverse(node[key], [...path, key]);
            }
        }
    }
}

traverse(astJson);
// const invocations = extractAWSInvocations(ast);
// console.log(invocations); // Output: ["lambda.Function", ...]

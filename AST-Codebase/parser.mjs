import * as parser from '@babel/parser';
import * as fs from 'fs';
import _traverse from "@babel/traverse";

const traverse = _traverse.default;

//const filePath = './test1.js'; // Specify the path to your TypeScript file
const filePath = './bookstore-backend-stack.ts'; // Specify the path to your TypeScript file
//const filePath = './test.ts'; // Specify the path to your TypeScript file

const code = fs.readFileSync(filePath, 'utf-8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
});

traverse(ast, {
    ExportNamedDeclaration(path) {
         console.log(path);
            const classDeclaration = path.get('declaration');
            if (classDeclaration.isClassDeclaration()) {
              const classBody = classDeclaration.get('body');

              // Iterate through the body of ClassDeclaration
              classBody.get('body').forEach(bodyNode => {
                // Check if the node is ExpressionStatement
                if (bodyNode.isExpressionStatement()) {
                  // Perform actions with ExpressionStatement
                  console.log('ExpressionStatement found:', bodyNode.node);
                }
              });
            }
    }
})


traverse(ast, {
    VariableDeclaration(path) {
        const declarations = path.get('declarations');

        declarations.forEach(declaration => {
            const init = declaration.get('init');

            if (init && (init.isCallExpression() || init.isNewExpression())) {
                const calleeMemberExpression = init.get('callee');
                const argumentsNodes = init.get('arguments');

                console.log('Callee:', calleeMemberExpression.node);
                argumentsNodes.forEach(argumentNode => {
                    console.log('  -> Argument:', argumentNode.node);
                });
                console.log('\n'); 
            }
        });
    },
});

function whoCalledWhom(ast) {
    console.log(ast);
    const relationships = {}; 

    function traverse(node, caller) {

        if (node.program.type === "VariableDeclaration") {
            node.declarations.forEach(declarator => {
                const { id, init } = declarator;

                if (init && (init.type === "CallExpression" || init.type === "NewExpression")) {
                    const calleeName = getCalleeName(init.callee); /
                  //
                    if (caller) {
                        relationships[caller] = relationships[caller] || {}; 
                        relationships[caller][calleeName] = id.name;
                    } else {
                        relationships[calleeName] = id.name; 
                    }
                }
            });
        } else {
            // Recursively traverse child nodes
            node?.children?.forEach(child => traverse(child, caller));
        }
    }

    function getCalleeName(calleeNode) {
        if (calleeNode.type === "MemberExpression") {
            return calleeNode.property.name;
        } else {
            return calleeNode.name;
        }
    }

    traverse(ast, null);
    return relationships;
}

const relationships = whoCalledWhom(ast);
console.log(relationships);
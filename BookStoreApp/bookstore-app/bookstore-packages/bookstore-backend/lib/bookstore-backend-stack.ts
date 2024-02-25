import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {join} from "path";
import * as path from "node:path";

export class BookstoreBackendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new cdk.aws_apigateway.RestApi(this, 'BookRestApi', {});

        // const userPool = new cdk.aws_cognito.UserPool(this, 'UserPool', {
        //     selfSignUpEnabled: true,
        //     autoVerify: {
        //         email: true,
        //     },
        // });
        //
        // const userPoolClient = new cdk.aws_cognito.UserPoolClient(this, 'UserPoolClient', {
        //     userPool,
        //     authFlows: {
        //         userPassword: true,
        //     },
        // });
        //
        // const authorizer = new cdk.aws_apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
        //     cognitoUserPools: [userPool],
        //     identitySource: 'method.request.header.Authorization',
        // });
        //
        // const userSignup = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'signup', {
        //     entry: join(__dirname, 'userSignup', 'handler.ts'),
        //     handler: 'handler',
        //     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        //     bundling: {
        //         externalModules: ['@aws-sdk'],
        //     },
        //     environment: {
        //         USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        //     },
        // });
        //
        // userSignup.addToRolePolicy(
        //     new cdk.aws_iam.PolicyStatement({
        //         actions: ['cognito-idp:SignUp'],
        //         resources: [userPool.userPoolArn],
        //     })
        // );
        //
        // const userSignin = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'signin', {
        //     entry: join(__dirname, 'userSignin', 'handler.ts'),
        //     handler: 'handler',
        //     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        //     bundling: {
        //         externalModules: ['@aws-sdk'],
        //     },
        //     environment: {
        //         USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        //     },
        // });
        //
        // userSignin.addToRolePolicy(
        //     new cdk.aws_iam.PolicyStatement({
        //         actions: ['cognito-idp:InitiateAuth', 'cognito-idp:RespondToAuthChallenge'],
        //         resources: [userPool.userPoolArn],
        //     })
        // );
        //
        // const confirmSignup = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'confirm', {
        //     entry: join(__dirname, 'confirmSignup', 'handler.ts'),
        //     handler: 'handler',
        //     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        //     bundling: {
        //         externalModules: ['@aws-sdk'],
        //     },
        //     environment: {
        //         USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        //     },
        // });
        //
        // confirmSignup.addToRolePolicy(
        //     new cdk.aws_iam.PolicyStatement({
        //         actions: ['cognito-idp:ConfirmSignUp'],
        //         resources: [userPool.userPoolArn],
        //     })
        // );
        //
        // const secret = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'secret', {
        //     entry: join(__dirname, 'secret', 'handler.ts'),
        //     handler: 'handler',
        //     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        //     bundling: {
        //         externalModules: ['@aws-sdk'],
        //     },
        // });
        //
        // api.root.addResource('sign-up').addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(userSignup));
        // api.root.addResource('sign-in').addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(userSignin));
        // api.root.addResource('confirm').addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(confirmSignup));
        // api.root.addResource('secret').addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(secret), {
        //     authorizer,
        //     authorizationType: cdk.aws_apigateway.AuthorizationType.COGNITO,
        // });


        const bookResource = api.root.addResource('Bookstore');
        bookResource.addCorsPreflight({
            allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
            allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
            allowHeaders: cdk.aws_apigateway.Cors.DEFAULT_HEADERS,
        });

        const table = new cdk.aws_dynamodb.Table(this, 'BooksTable', {
            partitionKey: {
                name: 'PK',
                type: cdk.aws_dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'SK',
                type: cdk.aws_dynamodb.AttributeType.STRING
            },
            billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const listBooks = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'listBooks', {
            entry: join(__dirname, 'listBooks', 'handler.ts'),
            handler: 'handler',
            environment: {
                TABLE_NAME: table.tableName,
            },
            bundling: {
                minify: true,
                externalModules: ['@aws-sdk/client-dynamodb']
            },
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        });

        table.grantReadData(listBooks);
        bookResource.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(listBooks), ) ;

        const createBook = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'CreateBook', {
            entry: join(__dirname, 'createBook', 'handler.ts'),
            handler: 'handler',
            environment: {
                TABLE_NAME: table.tableName,
            },
            bundling: {
                minify: true,
                externalModules: ['@aws-sdk/client-dynamodb']
            },
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        });

        table.grantWriteData(createBook);
        bookResource.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(createBook));

        const getBook = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'getBook', {
            entry: join(__dirname, 'getBook', 'handler.ts'),
            handler: 'handler',
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
            bundling: {
                externalModules: ['@aws-sdk'],
            },
            environment: {
                TABLE_NAME: table.tableName,
            },
        });
        table.grantReadData(getBook);
        bookResource.addResource('{id}').addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(getBook));
    }
}

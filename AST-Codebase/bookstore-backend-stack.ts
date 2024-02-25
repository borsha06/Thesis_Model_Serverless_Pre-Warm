import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {join} from "path";
// import * as path from "node:path";
// import {DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
// import {Handler} from "aws-cdk-lib/aws-lambda";
// import {handler} from "./listBooks/handler";
import { LambdaClient, InvokeCommand, LogType } from "@aws-sdk/client-lambda"

export class BookstoreBackendStack extends cdk.Stack {
     constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new cdk.aws_apigateway.RestApi(this, 'BookRestApi', {});
        const client = new LambdaClient({});

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
        const targetFunctionName = "arn:aws:lambda:eu-north-1:864706810063:function:BookstoreBackendStack-listBooks8BA55D6F-qsh4DkTD8Fup";
        // @ts-ignore
        const command = new InvokeCommand({
            FunctionName: targetFunctionName,
            LogType: LogType.Tail,
        });

        const account = async () => {
            await client.send(command);
        };

        try {
            account().then(r => "called");
        }
        catch (err){

        }
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
        bookResource.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(listBooks),);

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

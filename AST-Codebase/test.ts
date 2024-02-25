import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3_notifications from '@aws-cdk/aws-s3-notifications';
import * as iam from '@aws-cdk/aws-iam';

export class ProcessS3ZipStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const lambdaFunction = new lambda.Function(this, 'ProcessS3Zip', {
            runtime: lambda.Runtime.NODEJS_14_X, // Adjust as needed
            code: lambda.Code.fromAsset('lambda-src'), // Assuming code is in 'lambda-src' directory
            handler: 'index.handler',
        });

        const srcBucket = new s3.Bucket(this, 'MyObjectStorageForThePaper'); // Use meaningful bucket name

        // Grant S3 read and write permissions to the Lambda function
        srcBucket.grantRead(lambdaFunction);
        srcBucket.grantWrite(lambdaFunction);

        // Add S3 event notification to trigger the Lambda function
        new s3_notifications.LambdaDestination(srcBucket, new s3_notifications.SnsDestination(lambdaFunction));

        // Define the logic within the handler function
        lambdaFunction.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE, // Adjust as needed
        }); // Optional: expose the function as an HTTP endpoint

        lambdaFunction.grantInvoke(new iam.ServicePrincipal('lambda.amazonaws.com')); // Allow self-invocation
    }
}
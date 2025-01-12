import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';

import * as path from 'path';

export interface RestApiConstructProps {
    /** RAILS_MASTER_KEY */
    railsMasterKey: string,
}

/**
 * CDK construct to create API Gateway REST API with Lambda proxy integration
 */
export class RestApiConstruct extends Construct {
    /**
     * Create API Gateway REST API with Lambda proxy integration
     */
    constructor(scope: Construct, id: string, props: RestApiConstructProps) {
        super(scope, id);

        // Rails REST API container image with AWS Lambda Ruby Runtime Interface Client
        // https://github.com/aws/aws-lambda-ruby-runtime-interface-client
        const apiContainerImage = lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../'), {
            platform: Platform.LINUX_ARM64,
            ignoreMode: cdk.IgnoreMode.DOCKER,

            entrypoint: [
                '/usr/local/bundle/ruby/3.3.0/bin/bundle',
                'exec',
                '/usr/local/bundle/ruby/3.3.0/bin/aws_lambda_ric',
            ],
            cmd: [
                'lambda_rest.handler',
            ],
            exclude: ['.git/**', 'cdk/**', 'test/**'],
        });

        // Environment variables for Rails REST API container
        const apiContainerEnvironment = {
            BOOTSNAP_CACHE_DIR: '/tmp/cache',
            RAILS_ENV: 'production',
            RAILS_MASTER_KEY: props.railsMasterKey,
            RAILS_RELATIVE_URL_ROOT: '/default',
            RAILS_LOG_TO_STDOUT: '1',
        };

        // Lambda function for Lambda proxy integration of AWS API Gateway REST API
        const apiFunction = new lambda.DockerImageFunction(this, 'ApiFunction', {
            architecture: lambda.Architecture.ARM_64,
            memorySize: 2048,

            code: apiContainerImage,
            environment: apiContainerEnvironment,

            timeout: cdk.Duration.minutes(1),
            tracing: lambda.Tracing.ACTIVE,
        });

        // AWS API Gateway REST API using Rails as Lambda proxy integration
        const api = new apigw.LambdaRestApi(this, 'Api', {
            restApiName: 'RailsRestApi',
            handler: apiFunction,

            deployOptions: {
                stageName: 'default',
                tracingEnabled: true,
            },

            integrationOptions: {
                allowTestInvoke: false,
            },
        });

        new cdk.CfnOutput(this, 'RestApiUrl', {
            value: api.url,
        });
    }
}
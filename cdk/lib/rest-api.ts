import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as path from 'path';

export interface RestApiConstructProps {
    /** RAILS_MASTER_KEY */
    railsMasterKey: string;

    // 以下を追加: DB接続情報・VPC・セキュリティグループ
    dbHost?: string;
    dbPort?: number;
    dbName?: string;
    dbUser?: string;
    dbPassword?: string;

    vpc?: ec2.IVpc;
    securityGroups?: ec2.ISecurityGroup[];
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

        // 環境変数をまとめる (DB接続情報を追加)
        const apiContainerEnvironment: { [key: string]: string } = {
            BOOTSNAP_CACHE_DIR: '/tmp/cache',
            RAILS_ENV: 'production',
            RAILS_MASTER_KEY: props.railsMasterKey,
            RAILS_RELATIVE_URL_ROOT: '/default',
            RAILS_LOG_TO_STDOUT: '1',
        };
        if (props.dbHost)      apiContainerEnvironment.DB_HOST = props.dbHost;
        if (props.dbPort)      apiContainerEnvironment.DB_PORT = props.dbPort.toString();
        if (props.dbName)      apiContainerEnvironment.DB_NAME = props.dbName;
        if (props.dbUser)      apiContainerEnvironment.DB_USER = props.dbUser;
        if (props.dbPassword)  apiContainerEnvironment.DB_PASSWORD = props.dbPassword;

        // Lambda function for Lambda proxy integration of AWS API Gateway REST API
        const apiFunction = new lambda.DockerImageFunction(this, 'ApiFunction', {
            architecture: lambda.Architecture.ARM_64,
            memorySize: 2048,

            code: apiContainerImage,
            environment: apiContainerEnvironment,

            timeout: cdk.Duration.minutes(1),
            tracing: cdk.aws_lambda.Tracing.ACTIVE,

            // VPC 内で実行する場合は、以下を設定
            vpc: props.vpc,
            securityGroups: props.securityGroups,
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

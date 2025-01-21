import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    aws_apigatewayv2 as apigwv2,
    aws_apigatewayv2_integrations as apigwv2_integ
} from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as path from 'path';

export interface HttpApiConstructProps {
    /** RAILS_MASTER_KEY */
    railsMasterKey: string;

    // DB接続情報
    dbHost?: string;
    dbPort?: number;
    dbName?: string;
    dbUser?: string;
    dbPassword?: string;

    // VPC / SG
    vpc?: ec2.IVpc;
    securityGroups?: ec2.ISecurityGroup[];
}

/**
 * CDK construct to create API Gateway HTTP API with Lambda proxy integration 2.0
 */
export class HttpApiConstruct extends Construct {

    public readonly lambdaFunction: lambda.DockerImageFunction;
    public readonly railsHttpApi: apigwv2.HttpApi;

    constructor(scope: Construct, id: string, props: HttpApiConstructProps) {
        super(scope, id);

        // Docker image
        const apiContainerImage = lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../'), {
            platform: Platform.LINUX_ARM64,
            ignoreMode: cdk.IgnoreMode.DOCKER,

            entrypoint: [
                '/usr/local/bundle/ruby/3.3.0/bin/bundle',
                'exec',
                '/usr/local/bundle/ruby/3.3.0/bin/aws_lambda_ric',
            ],
            cmd: ['lambda_http.handler'],
            exclude: ['.git/**', 'cdk/**', 'test/**'],
        });

        // Environment variables (DB情報を反映)
        const env: { [key: string]: string } = {
            BOOTSNAP_CACHE_DIR: '/tmp/cache',
            RAILS_ENV: 'production',
            RAILS_MASTER_KEY: props.railsMasterKey,
            RAILS_LOG_TO_STDOUT: '1',
        };
        if (props.dbHost) env['DB_HOST'] = props.dbHost;
        if (props.dbPort) env['DB_PORT'] = props.dbPort.toString();
        if (props.dbName) env['DB_NAME'] = props.dbName;
        if (props.dbUser) env['DB_USER'] = props.dbUser;
        if (props.dbPassword) env['DB_PASSWORD'] = props.dbPassword;

        // Lambda function
        this.lambdaFunction = new lambda.DockerImageFunction(this, 'ApiFunction', {
            architecture: lambda.Architecture.ARM_64,
            memorySize: 2048,
            code: apiContainerImage,
            environment: env,
            timeout: cdk.Duration.minutes(1),
            tracing: lambda.Tracing.ACTIVE,

            // VPC内に配置
            vpc: props.vpc,
            securityGroups: props.securityGroups,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        });

        // HTTP API
        this.railsHttpApi = new apigwv2.HttpApi(this, 'Api', {
            apiName: 'RailsHttpApi',
            defaultIntegration: new apigwv2_integ.HttpLambdaIntegration('RailsHttpApiProxy', this.lambdaFunction, {
                payloadFormatVersion: apigwv2.PayloadFormatVersion.VERSION_2_0,
            }),
        });

        new cdk.CfnOutput(this, 'HttpApiUrl', {
            value: this.railsHttpApi.url!,
        });
    }
}

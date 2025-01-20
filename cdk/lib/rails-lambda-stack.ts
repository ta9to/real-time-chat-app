import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RestApiConstruct } from './rest-api';
import { HttpApiConstruct } from './http-api';
import { DatabaseConstruct } from './database-construct';
import { BastionConstruct } from './bastion-construct';
import { StorageConstruct } from './storage-construct';
import { RedisConstruct } from './redis-construct';

import { aws_iam as iam, aws_ec2 as ec2, aws_lambda as lambda } from 'aws-cdk-lib';

export interface RailsLambdaStackProps extends cdk.StackProps {
    /** RAILS_MASTER_KEY */
    railsMasterKey: string;
}

export class RailsLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: RailsLambdaStackProps) {
        super(scope, id, props);

        const dbConstruct = new DatabaseConstruct(this, 'DbConstruct', {});

        const bastionConstruct = new BastionConstruct(this, 'BastionConstruct', {
            vpc: dbConstruct.vpc,
            keyPairName: 'bastion',
        });

        const storageConstruct = new StorageConstruct(this, 'StorageConstruct', {
            bucketName: 'real-time-chat-app-activestorage-bucket',
            removalPolicy: cdk.RemovalPolicy.DESTROY, // 課題アプリなのでDESTROYでいい
        });

        const redisConstruct = new RedisConstruct(this, 'RedisConstruct', {
            vpc: dbConstruct.vpc,
            securityGroup: dbConstruct.dbSecurityGroup
        });

        new RestApiConstruct(this, 'Rest', {
            railsMasterKey: props.railsMasterKey,
            dbHost: dbConstruct.dbEndpoint,
            dbPort: dbConstruct.dbPort,
            dbName: dbConstruct.dbName,
            dbUser: dbConstruct.dbUser,
            dbPassword: dbConstruct.dbPassword,
            vpc: dbConstruct.vpc,
            securityGroups: [dbConstruct.dbSecurityGroup],
        });

        const httpApi = new HttpApiConstruct(this, 'Http', {
            railsMasterKey: props.railsMasterKey,
            dbHost: dbConstruct.dbEndpoint,
            dbPort: dbConstruct.dbPort,
            dbName: dbConstruct.dbName,
            dbUser: dbConstruct.dbUser,
            dbPassword: dbConstruct.dbPassword,
            vpc: dbConstruct.vpc,
            securityGroups: [dbConstruct.dbSecurityGroup],
        });
        const railsFunction = httpApi.lambdaFunction;

        // LambdaからS3へのread/write権限付与
        storageConstruct.bucket.grantReadWrite(railsFunction);
        // redis env
        railsFunction.addEnvironment('REDIS_HOST', redisConstruct.host);
        railsFunction.addEnvironment('REDIS_PORT', redisConstruct.port.toString());
    }
}

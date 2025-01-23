import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { HttpApiConstruct } from './http-api';
import { DatabaseConstruct } from './database-construct';
import { BastionConstruct } from './bastion-construct';
import { StorageConstruct } from './storage-construct';
import { CloudFrontConstruct } from './cloudfront-construct';
import { RedisConstruct } from './redis-construct';
import { DynamodbConstruct } from './dynamodb-construct';

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

        const dynamoConstruct = new DynamodbConstruct(this, 'DynamodbConstruct', {
            tableName: 'Messages',
        });
        railsFunction.addEnvironment('MESSAGES_TABLE_NAME', dynamoConstruct.messagesTable.tableName);
        dynamoConstruct.messagesTable.grantReadWriteData(railsFunction);

        storageConstruct.bucket.grantReadWrite(railsFunction);

        // redis env
        railsFunction.addEnvironment('REDIS_HOST', redisConstruct.host);
        railsFunction.addEnvironment('REDIS_PORT', redisConstruct.port.toString());

        const cfConstruct = new CloudFrontConstruct(this, 'CloudFront', {
            assetsBucket: storageConstruct.bucket,
        });

        railsFunction.addEnvironment('CLOUDFRONT_DOMAIN', cfConstruct.distribution.domainName);
    }
}

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RestApiConstruct } from './rest-api';
import { HttpApiConstruct } from './http-api';
import { DatabaseConstruct } from './database-construct';
import { BastionConstruct } from './bastion-construct';

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

        new RestApiConstruct(this, 'Rest', {
            railsMasterKey: props.railsMasterKey,

            // DB接続情報
            dbHost: dbConstruct.dbEndpoint,
            dbPort: dbConstruct.dbPort,
            dbName: dbConstruct.dbName,
            dbUser: dbConstruct.dbUser,
            dbPassword: dbConstruct.dbPassword,

            vpc: dbConstruct.vpc,
            securityGroups: [dbConstruct.dbSecurityGroup],
        });

        new HttpApiConstruct(this, 'Http', {
            railsMasterKey: props.railsMasterKey,

            dbHost: dbConstruct.dbEndpoint,
            dbPort: dbConstruct.dbPort,
            dbName: dbConstruct.dbName,
            dbUser: dbConstruct.dbUser,
            dbPassword: dbConstruct.dbPassword,

            vpc: dbConstruct.vpc,
            securityGroups: [dbConstruct.dbSecurityGroup],
        });
    }
}

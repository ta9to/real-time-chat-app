import { Construct } from 'constructs';
import {
    aws_ec2 as ec2,
    aws_rds as rds,
    RemovalPolicy,
    Stack,
    CfnOutput
} from 'aws-cdk-lib';
// @ts-ignore
import { Credentials, DatabaseInstanceEngine, PostgresEngineVersion, InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-rds';

export interface DatabaseConstructProps {}

/**
 * VPC + DB(RDS)を生成し、接続情報を提供するConstruct
 */
export class DatabaseConstruct extends Construct {
    public readonly vpc: ec2.Vpc;
    public readonly dbSecurityGroup: ec2.SecurityGroup;
    public readonly dbEndpoint: string;
    public readonly dbPort: number;
    public readonly dbName: string;
    public readonly dbUser: string;
    public readonly dbPassword: string;

    constructor(scope: Construct, id: string, props?: DatabaseConstructProps) {
        super(scope, id);

        const vpc = new ec2.Vpc(this, 'Vpc', {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    name: 'private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        });
        this.vpc = vpc;

        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
            vpc,
            description: 'Security group for RDS',
            allowAllOutbound: true,
        });
        // 検証用
        dbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'Allow Postgres from anywhere');
        this.dbSecurityGroup = dbSecurityGroup;

        const dbInstance = new rds.DatabaseInstance(this, 'DbInstance', {
            engine: DatabaseInstanceEngine.postgres({
                version: PostgresEngineVersion.VER_15,
            }),
            instanceType: new ec2.InstanceType('t4g.micro'),
            vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            securityGroups: [dbSecurityGroup],
            databaseName: 'myapp',
            credentials: Credentials.fromGeneratedSecret('postgres'),
            removalPolicy: RemovalPolicy.DESTROY,
            deleteAutomatedBackups: true,
            publiclyAccessible: false,
        });

        this.dbEndpoint = dbInstance.instanceEndpoint.hostname;
        this.dbPort = dbInstance.instanceEndpoint.port;
        this.dbName = 'myapp';
        const secret = dbInstance.secret;
        this.dbUser = secret?.secretValueFromJson('username')?.toString() || 'postgres';
        this.dbPassword = secret?.secretValueFromJson('password')?.toString() || '';

        new CfnOutput(this, 'DbEndpoint', { value: this.dbEndpoint });
    }
}

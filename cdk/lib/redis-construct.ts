import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as cdk from 'aws-cdk-lib';

export interface RedisConstructProps {
    vpc: ec2.IVpc;
    securityGroup: ec2.ISecurityGroup;
}

export class RedisConstruct extends Construct {
    public readonly host: string;
    public readonly port: number;

    constructor(scope: Construct, id: string, props: RedisConstructProps) {
        super(scope, id);

        const subnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
            description: 'Subnet group for Redis',
            subnetIds: props.vpc.privateSubnets.map(s => s.subnetId),
        });

        props.securityGroup.addIngressRule(
            props.securityGroup,
            ec2.Port.tcp(6379),
            'Allow inbound Redis from self (same SG) or from Lambda SG'
        );

        const redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
            cacheNodeType: 'cache.t4g.micro',
            engine: 'redis',
            numCacheNodes: 1,
            clusterName: 'myRedis',
            cacheSubnetGroupName: subnetGroup.ref,
            vpcSecurityGroupIds: [props.securityGroup.securityGroupId],
        });

        this.host = redisCluster.attrRedisEndpointAddress;
        this.port = cdk.Token.asNumber(redisCluster.attrRedisEndpointPort);
    }
}

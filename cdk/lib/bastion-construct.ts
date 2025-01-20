// cdk/lib/bastion-construct.ts
import { Construct } from 'constructs';
import { aws_ec2 as ec2, CfnOutput } from 'aws-cdk-lib';

export interface BastionConstructProps {
    /** VPC where the Bastion should be placed */
    vpc: ec2.IVpc;

    /**
     * Optional: Security Group to allow inbound SSH from your IP.
     * If not provided, we'll create a new one with open inbound for debugging (not recommended).
     */
    bastionSG?: ec2.ISecurityGroup;

    keyPairName: string;

    /**
     * If you'd like to specify instance size
     */
    instanceType?: ec2.InstanceType;
}

/**
 * BastionConstruct creates a simple EC2 instance in a PUBLIC SUBNET
 * that acts as a bastion host (SSH jump box).
 */
export class BastionConstruct extends Construct {
    public readonly instance: ec2.Instance;
    public readonly securityGroup: ec2.ISecurityGroup;

    constructor(scope: Construct, id: string, props: BastionConstructProps) {
        super(scope, id);

        const bastionSG = props.bastionSG ?? new ec2.SecurityGroup(this, 'BastionSG', {
            vpc: props.vpc,
            description: 'Security group for Bastion Host',
            allowAllOutbound: true,
        });
        // テスト用にすべてのIPからSSH(22)を許可
        if (!props.bastionSG) {
            bastionSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH from anywhere (demo only!)');
        }

        this.securityGroup = bastionSG;

        const keyPair = ec2.KeyPair.fromKeyPairName(this, 'KeyPair', props.keyPairName);
        this.instance = new ec2.Instance(this, 'BastionInstance', {
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
            instanceType: props.instanceType ?? ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            securityGroup: bastionSG,
            keyPair: keyPair,
        });

        new CfnOutput(this, 'BastionPublicIp', {
            value: this.instance.instancePublicIp,
            description: 'Bastion Host public IP. SSH with "ec2-user@" + that IP',
        });

        new CfnOutput(this, 'BastionId', {
            value: this.instance.instanceId,
            description: 'Bastion EC2 Instance ID',
        });
    }
}

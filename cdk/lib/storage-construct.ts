import { Construct } from 'constructs';
import { aws_s3 as s3, RemovalPolicy } from 'aws-cdk-lib';

export interface StorageConstructProps {
    bucketName?: string;
    removalPolicy?: RemovalPolicy;
}

export class StorageConstruct extends Construct {
    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: StorageConstructProps) {
        super(scope, id);

        this.bucket = new s3.Bucket(this, 'ActiveStorageBucket', {
            bucketName: props?.bucketName, // or undefined → 自動生成名
            removalPolicy: props?.removalPolicy ?? RemovalPolicy.RETAIN,
            // encryption: s3.BucketEncryption.S3_MANAGED,
            // versioned: true,
            publicReadAccess: false,
            // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

    }
}

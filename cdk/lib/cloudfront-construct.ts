import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface CloudFrontConstructProps {
    assetsBucket: s3.IBucket;
}

export class CloudFrontConstruct extends Construct {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: CloudFrontConstructProps) {
        super(scope, id);

        // 1) Create an Origin Access Control (OAC) for S3
        const s3Oac = new cloudfront.S3OriginAccessControl(this, 'S3OAC');

        // 2) Use the static .withOriginAccessControl() method
        const s3Origin = S3BucketOrigin.withOriginAccessControl(props.assetsBucket, {
            originAccessControl: s3Oac,
        });

        // 4) Create CloudFront distribution
        this.distribution = new cloudfront.Distribution(this, 'Distribution', {
            priceClass: cloudfront.PriceClass.PRICE_CLASS_200,

            defaultBehavior: {
                origin: s3Origin,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
            },
        });

        // 5) Output the domain
        new cdk.CfnOutput(this, 'CloudFrontDomainName', {
            value: this.distribution.domainName,
        });
    }
}

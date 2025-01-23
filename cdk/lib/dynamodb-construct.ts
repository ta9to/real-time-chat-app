import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface DynamodbConstructProps {
    tableName?: string;
}

export class DynamodbConstruct extends Construct {
    public readonly messagesTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: DynamodbConstructProps) {
        super(scope, id);

        const tableName = props?.tableName || 'Messages';

        this.messagesTable = new dynamodb.Table(this, 'MessagesTable', {
            tableName,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}

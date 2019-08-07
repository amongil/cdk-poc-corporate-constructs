import cdk = require('@aws-cdk/core');
import dynamoDb = require('@aws-cdk/aws-dynamodb');


export interface DynamoTableProps {
    readonly keySchema: any, // mandatory fields
    readonly [others: string]: any; // need to allow for other non-mandatory fields without directly specifying them all
}

export class DynamoTable extends cdk.Construct {
  public readonly cfnDynamoTable: dynamoDb.CfnTable;

  constructor(scope: cdk.Construct, id: string, props: DynamoTableProps) {
    super(scope, id);

    this.cfnDynamoTable = new dynamoDb.CfnTable(this, 'CfnDynamoTable', props);
    this.node.applyAspect(new DynamoEncryptionChecker())
    this.node.applyAspect(new DynamoTagsChecker())
  }
}

class DynamoEncryptionChecker implements cdk.IAspect {
  public visit(node: cdk.IConstruct): void {
    if (node instanceof dynamoDb.CfnTable) {
      if (!node.sseSpecification) {
        node.node.addError('Table encryption is not enabled');
      }
    }
  }
}

class DynamoTagsChecker implements cdk.IAspect {
  public visit(node: cdk.IConstruct): void {
    if (node instanceof dynamoDb.CfnTable) {
      var tags: string[] = [];
      for (let tagObject of node.tags.renderTags()) {
        tags.push(tagObject['key'])
      }
    
      if (!(tags.includes('Department'))) {
          node.node.addError('You must specify the \'Department\' tag for your DynamoDB CfnTable construct');
      }
    }
  }
}

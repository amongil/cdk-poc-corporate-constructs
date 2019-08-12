import cdk = require('@aws-cdk/core');
import rds = require('@aws-cdk/aws-rds');


export interface ProductionPostgresqlProps {
    readonly dbInstanceClass: any;
    readonly [others: string]: any; // need to allow for other non-mandatory fields without directly specifying them all
}

export class ProductionPostgresql extends cdk.Construct {
  public readonly productionPostgresql: rds.CfnDBInstance;

  constructor(scope: cdk.Construct, id: string, props: ProductionPostgresqlProps) {
    super(scope, id);

    this.productionPostgresql = new rds.CfnDBInstance(this, 'productionPostgresql', props);
    this.node.applyAspect(new RdsMultiAzEnabled())
    this.node.applyAspect(new RdsPostgresqlEngine())
    this.node.applyAspect(new RdsTagsChecker())
  }
}

class RdsMultiAzEnabled implements cdk.IAspect {
    public visit(node: cdk.IConstruct): void {
      if (node instanceof rds.CfnDBInstance) {
        node.multiAz = true
      }
    }
}

class RdsPostgresqlEngine implements cdk.IAspect {
    public visit(node: cdk.IConstruct): void {
      if (node instanceof rds.CfnDBInstance) {
        node.engine = 'postgres';
        node.engineVersion = '11.4'
      }
    }
}

class RdsTagsChecker implements cdk.IAspect {
  public visit(node: cdk.IConstruct): void {
    if (node instanceof rds.CfnDBInstance) {
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

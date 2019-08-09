import cdk = require('@aws-cdk/core');
import rds = require('@aws-cdk/aws-rds');


export interface ProductionPostgresqlProps {
    dbInstanceClass: any;
    readonly multiAz: boolean;
    readonly [others: string]: any; // need to allow for other non-mandatory fields without directly specifying them all
}

export class ProductionPostgresql extends cdk.Construct {
  public readonly productionPostgresql: rds.CfnDBInstance;

  constructor(scope: cdk.Construct, id: string, props: ProductionPostgresqlProps) {
    super(scope, id);

    this.productionPostgresql = new rds.CfnDBInstance(this, 'productionPostgresql', props);
    this.node.applyAspect(new RdsMultiAzEnabled())
    this.node.applyAspect(new RdsPostgresqlEngine())
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

import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');


export interface BucketProps {}

export class Bucket extends cdk.Construct {
  public readonly cfnBucket: s3.CfnBucket;

  constructor(scope: cdk.Construct, id: string, props: BucketProps = {}) {
    super(scope, id);

    this.cfnBucket = new s3.CfnBucket(this, 'CfnBucket', props);
    this.node.applyAspect(new BucketVersioningChecker())
    this.node.applyAspect(new BucketEncryptionChecker())
    this.node.applyAspect(new BucketTagsChecker())
  }
}

class BucketVersioningChecker implements cdk.IAspect {
  public visit(node: cdk.IConstruct): void {
    // See that we're dealing with a CfnBucket
    if (node instanceof s3.CfnBucket) {

      // Check for versioning property, exclude the case where the property
      // can be a token (IResolvable).
      if (!node.versioningConfiguration 
        || (!cdk.Tokenization.isResolvable(node.versioningConfiguration)
            && node.versioningConfiguration.status !== 'Enabled')) {
        
        node.node.addError('Bucket versioning is not enabled');
      }
    }
  }
}

class BucketEncryptionChecker implements cdk.IAspect {
  public visit(node: cdk.IConstruct): void {
    if (node instanceof s3.CfnBucket) {
      if (!node.bucketEncryption) {
        node.node.addError('Bucket encryption is not enabled');
      }
    }
  }
}

class BucketTagsChecker implements cdk.IAspect {
  public visit(node: cdk.IConstruct): void {
    if (node instanceof s3.CfnBucket) {
      if(!node.tags.hasTags()) {
        node.node.addError('You must specify the \'Department\' tag for your DynamoDB CfnTable construct');
      } else {
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
}
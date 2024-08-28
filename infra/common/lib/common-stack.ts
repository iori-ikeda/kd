import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Config } from '../config';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CommonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, config: Config, props?: cdk.StackProps) {
    super(scope, id, props);

  }
}

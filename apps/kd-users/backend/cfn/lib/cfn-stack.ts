import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import type { Config } from "../config";

export class CfnStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		config: Config,
		props?: cdk.StackProps,
	) {
		super(scope, id, props);
	}
}

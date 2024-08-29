import type { Construct } from "constructs";
import type { Config } from "../config";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class CommonStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		config: Config,
		props?: cdk.StackProps,
	) {
		super(scope, id, props);
		const idWithHyphen = `${id}-`;

		const vpc = new ec2.CfnVPC(this, `${idWithHyphen}vpc`, {
			cidrBlock: "10.0.0.0/16",
			tags: [{ key: "Name", value: `${idWithHyphen}vpc` }],
		});
	}
}

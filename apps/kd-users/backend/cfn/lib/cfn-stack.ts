import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import type { Config } from "../config";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class CfnStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		config: Config,
		props?: cdk.StackProps,
	) {
		super(scope, id, props);
		const idWithHyphen = `${id}-`;

		const ecrRepository = new ecr.Repository(
			this,
			`${idWithHyphen}ecr-repository`,
			{
				repositoryName: `${idWithHyphen}ecr-repository`,
				removalPolicy: cdk.RemovalPolicy.DESTROY, // 本来ならデフォルトの RETAIN にすべき。コスト削減のために、cdk destroy を頻繁に行う予定があるためこの値にしてある。
				emptyOnDelete: true,
				encryption: ecr.RepositoryEncryption.KMS,
				// TODO: lifecycle や scan の設定
			},
		);
	}
}

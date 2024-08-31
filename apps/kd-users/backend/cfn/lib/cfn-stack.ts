import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Config } from "../config";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";

export class CfnStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		config: Config,
		props?: cdk.StackProps,
	) {
		super(scope, id, props);
		const idWithHyphen = `${id}-`;

		const vpc = ec2.Vpc.fromLookup(this, `${idWithHyphen}vpc`, {
			vpcId: config.vpc.id,
		});

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

		const ecsCluster = new ecs.Cluster(this, `${idWithHyphen}cluster`, {
			clusterName: `${idWithHyphen}cluster`,
			vpc,
			containerInsights: true,
		});

		//TODO:  common に置いても良い？
		const taskExecutionRole = new iam.Role(
			this,
			`${idWithHyphen}task-execution-role`,
			{
				roleName: `${idWithHyphen}task-execution-role`,
				assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
				managedPolicies: [
					iam.ManagedPolicy.fromAwsManagedPolicyName(
						"service-role/AmazonECSTaskExecutionRolePolicy",
					),
				],
			},
		);

		const taskRole = new iam.Role(this, `${idWithHyphen}task-role`, {
			roleName: `${idWithHyphen}task-role`,
			assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
		});
		// TODO: ポリシーを追加

		const taskDefinition = new ecs.TaskDefinition(
			this,
			`${idWithHyphen}task-definition`,
			{
				family: `${idWithHyphen}task-definition`,
				compatibility: ecs.Compatibility.FARGATE,
				cpu: config.ecs.taskDef.cpu.toString(),
				memoryMiB: config.ecs.taskDef.memoryMiB.toString(),
				networkMode: ecs.NetworkMode.AWS_VPC,
				executionRole: taskExecutionRole,
				taskRole,
			},
		);
		taskDefinition
			.addContainer(`${idWithHyphen}container`, {
				image: ecs.ContainerImage.fromEcrRepository(ecrRepository, "latest"),
				cpu: config.ecs.taskDef.container.cpu,
				memoryLimitMiB: config.ecs.taskDef.container.memoryLimitMiB,
			})
			.addPortMappings({
				containerPort: config.ecs.taskDef.container.containerPort,
				hostPort: config.ecs.taskDef.container.hostPort,
				protocol: ecs.Protocol.TCP,
			});
	}
}

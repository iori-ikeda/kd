import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Config } from "../config";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as logs from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as rds from "aws-cdk-lib/aws-rds";

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

		const logGroup = new logs.LogGroup(this, `${idWithHyphen}log-group`, {
			logGroupName: `/ecs/${idWithHyphen}log-group`,
			retention: logs.RetentionDays.INFINITE,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
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

		const ingressSubnets = vpc.selectSubnets({
			subnets: [
				ec2.Subnet.fromSubnetAttributes(
					this,
					`${idWithHyphen}ingress-subnet-1`,
					{
						subnetId: config.alb.subnets[0].subnetId,
						availabilityZone: config.alb.subnets[0].availabilityZone,
					},
				),
				ec2.Subnet.fromSubnetAttributes(
					this,
					`${idWithHyphen}ingress-subnet-2`,
					{
						subnetId: config.alb.subnets[1].subnetId,
						availabilityZone: config.alb.subnets[1].availabilityZone,
					},
				),
			],
		});

		const publicLoadBalancerSG = ec2.SecurityGroup.fromSecurityGroupId(
			this,
			`${idWithHyphen}public-load-balancer-sg`,
			config.alb.securityGroupId,
		);

		const alb = new elbv2.ApplicationLoadBalancer(this, `${idWithHyphen}alb`, {
			vpc,
			internetFacing: true,
			vpcSubnets: ingressSubnets,
			securityGroup: publicLoadBalancerSG,
		});

		const targetGroup = new elbv2.ApplicationTargetGroup(
			this,
			`${idWithHyphen}target-group`,
			{
				targetGroupName: `${idWithHyphen}target-group`,
				vpc,
				port: config.alb.listener.targetGroups[0].port,
				protocol: elbv2.ApplicationProtocol.HTTP,
				targetType: elbv2.TargetType.IP,
				healthCheck: {
					path: config.alb.listener.targetGroups[0].healthCheck.path,
					protocol: elbv2.Protocol.HTTP,
					healthyHttpCodes: "200",
				},
			},
		);

		const listener = new elbv2.ApplicationListener(
			this,
			`${idWithHyphen}listener`,
			{
				protocol: elbv2.ApplicationProtocol.HTTPS,
				certificates: [
					acm.Certificate.fromCertificateArn(
						this,
						`${idWithHyphen}certificate`,
						config.alb.listener.certificates[0].certificateArn,
					),
				],
				port: config.alb.listener.port,
				loadBalancer: alb,
				defaultTargetGroups: [targetGroup],
			},
		);

		const hostZone = route53.HostedZone.fromLookup(
			this,
			`${idWithHyphen}host-zone`,
			{
				domainName: config.route53.zoneName,
			},
		);
		new route53.ARecord(this, `${idWithHyphen}alb-record`, {
			region: this.region,
			recordName: config.alb.domain,
			target: route53.RecordTarget.fromAlias(
				new targets.LoadBalancerTarget(alb),
			),
			zone: hostZone,
		});

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
					iam.ManagedPolicy.fromAwsManagedPolicyName(
						"AmazonEC2ContainerRegistryReadOnly",
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
				cpu: config.ecs.taskDef.cpu,
				memoryMiB: config.ecs.taskDef.memoryMiB,
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
				logging: ecs.LogDrivers.awsLogs({
					logGroup,
					streamPrefix: `${idWithHyphen}container`, // TODO: ログのプレフィックスを変更する
				}),
			})
			.addPortMappings({
				containerPort: config.ecs.taskDef.container.containerPort,
				hostPort: config.ecs.taskDef.container.hostPort,
				protocol: ecs.Protocol.TCP,
			});

		const fargateServiceSG = ec2.SecurityGroup.fromSecurityGroupId(
			this,
			`${idWithHyphen}fargate-service-sg`,
			config.ecs.fargateService.securityGroupId,
		);

		const fargateService = new ecs.FargateService(
			this,
			`${idWithHyphen}fargate-service`,
			{
				cluster: ecsCluster,
				serviceName: `${idWithHyphen}fargate-service`,
				taskDefinition,
				desiredCount: 1,
				assignPublicIp: true,
				securityGroups: [fargateServiceSG],
				// vpcSubnets: {
				// 	subnets: [
				// 		ec2.Subnet.fromSubnetAttributes(
				// 			this,
				// 			`${idWithHyphen}fargate-subnet-1`,
				// 			{
				// 				subnetId: config.ecs.fargateService.subnets[0].subnetId,
				// 				availabilityZone:
				// 					config.ecs.fargateService.subnets[0].availabilityZone,
				// 			},
				// 		),
				// 		ec2.Subnet.fromSubnetAttributes(
				// 			this,
				// 			`${idWithHyphen}fargate-subnet-2`,
				// 			{
				// 				subnetId: config.ecs.fargateService.subnets[1].subnetId,
				// 				availabilityZone:
				// 					config.ecs.fargateService.subnets[1].availabilityZone,
				// 			},
				// 		),
				// 	],
				// },
				// TODO: ↑ application 用の private subnet を使う。↓は public subnet なので、セキュリティ的によろしくない
				vpcSubnets: ingressSubnets,
			},
		);

		fargateService.attachToApplicationTargetGroup(targetGroup);

		const rdsSG = ec2.SecurityGroup.fromSecurityGroupId(
			this,
			`${idWithHyphen}rds-sg`,
			config.rds.securityGroupId,
		);

		const engine = rds.DatabaseClusterEngine.auroraMysql({
			version: rds.AuroraMysqlEngineVersion.VER_3_07_1,
		});

		const dbClusterParameterGroup = new rds.ParameterGroup(
			this,
			`${idWithHyphen}db-cluster-parameter-group`,
			{
				engine,
				parameters: {
					character_set_client: "utf8mb4",
					character_set_connection: "utf8mb4",
					character_set_database: "utf8mb4",
					character_set_results: "utf8mb4",
					character_set_server: "utf8mb4",
					collation_server: "utf8mb4_unicode_ci",
					collation_connection: "utf8mb4_unicode_ci",
					character_set_filesystem: "utf8mb4",
					general_log: "1",
					slow_query_log: "1",
					long_query_time: "2",
				},
			},
		);

		const dbInstanceParameterGroup = new rds.ParameterGroup(
			this,
			`${idWithHyphen}db-instance-parameter-group`,
			{
				engine,
				parameters: {},
			},
		);

		const rdsSubnets = vpc.selectSubnets({
			subnets: [
				ec2.Subnet.fromSubnetAttributes(this, `${idWithHyphen}rds-subnet-1`, {
					subnetId: config.rds.subnets[0].subnetId,
					availabilityZone: config.rds.subnets[0].availabilityZone,
				}),
				ec2.Subnet.fromSubnetAttributes(this, `${idWithHyphen}rds-subnet-2`, {
					subnetId: config.rds.subnets[1].subnetId,
					availabilityZone: config.rds.subnets[1].availabilityZone,
				}),
			],
		});

		const rdsSubnetGroup = new rds.SubnetGroup(
			this,
			`${idWithHyphen}rds-subnet-group`,
			{
				subnetGroupName: `${idWithHyphen}rds-subnet-group`,
				description: `${idWithHyphen}rds-subnet-group`,
				vpc,
				vpcSubnets: rdsSubnets,
			},
		);

		const dbCluster = new rds.DatabaseCluster(
			this,
			`${idWithHyphen}db-cluster`,
			{
				vpc,
				clusterIdentifier: `${idWithHyphen}db-cluster`,
				engine,
				parameterGroup: dbClusterParameterGroup,
				cloudwatchLogsExports: ["general", "slowquery"],
				defaultDatabaseName: id.replace(/-/g, "_"),
				subnetGroup: rdsSubnetGroup,
				writer: cdk.aws_rds.ClusterInstance.provisioned(
					`${idWithHyphen}rds-writer-instance`,
					{
						instanceIdentifier: `${idWithHyphen}rds-writer-instance`,
						instanceType: ec2.InstanceType.of(
							ec2.InstanceClass.T3,
							ec2.InstanceSize.MEDIUM,
						),
						parameterGroup: dbInstanceParameterGroup,
					},
				),
				readers: [],
				storageEncrypted: true,
				removalPolicy: cdk.RemovalPolicy.DESTROY, // 本来なら RETAIN にすべき。コスト削減のために、cdk destroy を頻繁に行う予定があるためこの値にしてある。
				securityGroups: [rdsSG],
			},
		);
	}
}

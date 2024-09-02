import type { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Tags } from "aws-cdk-lib";
import type { Config } from "../config";

export class CommonStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		config: Config,
		props?: cdk.StackProps,
	) {
		super(scope, id, props);
		const idWithHyphen = `${id}-`;

		const vpc = new ec2.Vpc(this, `${idWithHyphen}vpc`, {
			ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
			vpcName: `${idWithHyphen}vpc`,
			subnetConfiguration: [],
			enableDnsHostnames: true,
			enableDnsSupport: true,
		});

		const internetGateway = createInternetGateway(this, idWithHyphen, vpc);

		const publicRouteTable = createPublicRouteTable(
			this,
			idWithHyphen,
			vpc,
			internetGateway,
		);

		// 65,536 個の ip アドレスを 32 個のサブネットに分割する
		// 1つのサブネットあたり 2048 個の ip アドレスを持つことになる
		const subnetCiderBlocks = [
			"10.0.0.0/21", // 10.0.0.0 - 10.0.7.255
			"10.0.8.0/21", // 10.0.8.0 - 10.0.15.255
			"10.0.16.0/21", // 10.0.16.0 - 10.0.23.255
			"10.0.24.0/21", // 10.0.24.0 - 10.0.31.255
			"10.0.32.0/21", // 10.0.32.0 - 10.0.39.255
			"10.0.40.0/21", // 10.0.40.0 - 10.0.47.255
			"10.0.48.0/21", // 10.0.48.0 - 10.0.55.255
			"10.0.56.0/21", // 10.0.56.0 - 10.0.63.255
			"10.0.64.0/21", // 10.0.64.0 - 10.0.71.255
			"10.0.72.0/21", // 10.0.72.0 - 10.0.79.255
			"10.0.80.0/21", // 10.0.80.0 - 10.0.87.255
			"10.0.88.0/21", // 10.0.88.0 - 10.0.95.255
			"10.0.96.0/21", // 10.0.96.0 - 10.0.103.255
			"10.0.104.0/21", // 10.0.104.0 - 10.0.111.255
			"10.0.112.0/21", // 10.0.112.0 - 10.0.119.255
			"10.0.120.0/21", // 10.0.120.0 - 10.0.127.255
			"10.0.128.0/21", // 10.0.128.0 - 10.0.135.255
			"10.0.136.0/21", // 10.0.136.0 - 10.0.143.255
			"10.0.144.0/21", // 10.0.144.0 - 10.0.151.255
			"10.0.152.0/21", // 10.0.152.0 - 10.0.159.255
			"10.0.160.0/21", // 10.0.160.0 - 10.0.167.255
			"10.0.168.0/21", // 10.0.168.0 - 10.0.175.255
			"10.0.176.0/21", // 10.0.176.0 - 10.0.183.255
			"10.0.184.0/21", // 10.0.184.0 - 10.0.191.255
			"10.0.192.0/21", // 10.0.192.0 - 10.0.199.255
			"10.0.200.0/21", // 10.0.200.0 - 10.0.207.255
			"10.0.208.0/21", // 10.0.208.0 - 10.0.215.255
			"10.0.216.0/21", // 10.0.216.0 - 10.0.223.255
			"10.0.224.0/21", // 10.0.224.0 - 10.0.231.255
			"10.0.232.0/21", // 10.0.232.0 - 10.0.239.255
			"10.0.240.0/21", // 10.0.240.0 - 10.0.247.255
			"10.0.248.0/21", // 10.0.248.0 - 10.0.255.255
		];
		const availabilityZones = ["a", "c", "d"];

		const {
			ingressSubnets,
			applicationSubnets,
			dbSubnets,
			managementSubnets,
			egressSubnets,
			publicSubnets,
			privateSubnets,
			subnets,
		} = createSubnets(
			this,
			idWithHyphen,
			vpc,
			subnetCiderBlocks,
			availabilityZones,
		);

		associatePublicSubnetsToPublicRouteTable(
			this,
			idWithHyphen,
			publicSubnets,
			publicRouteTable,
		);

		const publicLoadBalancerSG = createPublicLoadBalancerSecurityGroup(
			this,
			idWithHyphen,
			vpc,
		);

		const fargateServiceSG = createFargateServiceSecurityGroup(
			this,
			idWithHyphen,
			vpc,
			publicLoadBalancerSG,
		);

		const engressRouteTable = createEngressRouteTable(this, idWithHyphen, vpc);

		associateEgressSubnetsToEngressRouteTable(
			this,
			idWithHyphen,
			egressSubnets,
			engressRouteTable,
		);

		createVpcEndpoints(
			this,
			idWithHyphen,
			vpc,
			engressRouteTable,
			egressSubnets,
		);
	}
}

const createInternetGateway = (
	scope: CommonStack,
	idWithHyphen: string,
	vpc: ec2.Vpc,
) => {
	const internetGateway = new ec2.CfnInternetGateway(
		scope,
		`${idWithHyphen}igw`,
		{
			tags: [
				{
					key: "Name",
					value: `${idWithHyphen}igw`,
				},
			],
		},
	);

	new ec2.CfnVPCGatewayAttachment(scope, `${idWithHyphen}igw-attachment`, {
		vpcId: vpc.vpcId,
		internetGatewayId: internetGateway.ref,
	});

	return internetGateway;
};

const createPublicRouteTable = (
	scope: CommonStack,
	idWithHyphen: string,
	vpc: ec2.Vpc,
	internetGateway: ec2.CfnInternetGateway,
) => {
	const publicRouteTable = new ec2.CfnRouteTable(
		scope,
		`${idWithHyphen}public-route-table`,
		{
			vpcId: vpc.vpcId,
			tags: [
				{
					key: "Name",
					value: `${idWithHyphen}public-route-table`,
				},
			],
		},
	);

	new ec2.CfnRoute(scope, `${idWithHyphen}public-route`, {
		routeTableId: publicRouteTable.ref,
		destinationCidrBlock: "0.0.0.0/0",
		gatewayId: internetGateway.ref,
	});

	return publicRouteTable;
};

const createEngressRouteTable = (
	scope: CommonStack,
	idWithHyphen: string,
	vpc: ec2.Vpc,
) => {
	const engressRouteTable = new ec2.CfnRouteTable(
		scope,
		`${idWithHyphen}engress-route-table`,
		{
			vpcId: vpc.vpcId,
			tags: [
				{
					key: "Name",
					value: `${idWithHyphen}engress-route-table`,
				},
			],
		},
	);

	return engressRouteTable;
};

const createSubnets = (
	scope: CommonStack,
	idWithHyphen: string,
	vpc: ec2.Vpc,
	subnetCiderBlocks: string[],
	availabilityZones: string[],
) => {
	const subnets: ec2.CfnSubnet[] = [];
	let publicSubnets: ec2.CfnSubnet[] = [];
	let privateSubnets: ec2.CfnSubnet[] = [];

	// Ingress 用の public subnet を2つの AZ に作成する
	const ingressSubnetCiderBlocks = subnetCiderBlocks.splice(0, 2);
	const ingressSubnets = ingressSubnetCiderBlocks.map((cidrBlock, index) => {
		const nth = index + 1;
		const cfnIngressSubnet = new cdk.aws_ec2.CfnSubnet(
			scope,
			`${idWithHyphen}ingress-subnet-${nth}`,
			{
				cidrBlock,
				availabilityZone: `${scope.region}${availabilityZones[index]}`,
				vpcId: vpc.vpcId,
				mapPublicIpOnLaunch: true,
			},
		);
		Tags.of(cfnIngressSubnet).add(
			"Name",
			`${idWithHyphen}ingress-subnet-${nth}`,
		);

		return cfnIngressSubnet;
	});
	subnets.push(...ingressSubnets);

	// application 用の private subnet を2つの AZ に作成する
	const applicationSubnetCiderBlocks = subnetCiderBlocks.splice(0, 2);
	const applicationSubnets = applicationSubnetCiderBlocks.map(
		(cidrBlock, index) => {
			const nth = index + 1;
			const cfnApplicationSubnet = new cdk.aws_ec2.CfnSubnet(
				scope,
				`${idWithHyphen}application-subnet-${nth}`,
				{
					cidrBlock,
					availabilityZone: `${scope.region}${availabilityZones[index]}`,
					vpcId: vpc.vpcId,
					mapPublicIpOnLaunch: false,
				},
			);
			Tags.of(cfnApplicationSubnet).add(
				"Name",
				`${idWithHyphen}application-subnet-${nth}`,
			);

			return cfnApplicationSubnet;
		},
	);
	subnets.push(...applicationSubnets);

	// db 用の private subnet を2つの AZ に作成する
	const dbSubnetCiderBlocks = subnetCiderBlocks.splice(0, 2);
	const dbSubnets = dbSubnetCiderBlocks.map((cidrBlock, index) => {
		const nth = index + 1;
		const cfnDbSubnet = new cdk.aws_ec2.CfnSubnet(
			scope,
			`${idWithHyphen}db-subnet-${nth}`,
			{
				cidrBlock,
				availabilityZone: `${scope.region}${availabilityZones[index]}`,
				vpcId: vpc.vpcId,
				mapPublicIpOnLaunch: false,
			},
		);
		Tags.of(cfnDbSubnet).add("Name", `${idWithHyphen}db-subnet-${nth}`);

		return cfnDbSubnet;
	});
	subnets.push(...dbSubnets);

	// 管理用の private subnet を2つの AZ に作成する
	const managementSubnetCiderBlocks = subnetCiderBlocks.splice(0, 2);
	const managementSubnets = managementSubnetCiderBlocks.map(
		(cidrBlock, index) => {
			const nth = index + 1;
			const cfnManagementSubnet = new cdk.aws_ec2.CfnSubnet(
				scope,
				`${idWithHyphen}management-subnet-${nth}`,
				{
					cidrBlock,
					availabilityZone: `${scope.region}${availabilityZones[index]}`,
					vpcId: vpc.vpcId,
					mapPublicIpOnLaunch: false,
				},
			);
			Tags.of(cfnManagementSubnet).add(
				"Name",
				`${idWithHyphen}management-subnet-${nth}`,
			);

			return cfnManagementSubnet;
		},
	);
	subnets.push(...managementSubnets);

	// egress 用の private subnet を2つの AZ に作成する
	const egressSubnetCiderBlocks = subnetCiderBlocks.splice(0, 2);
	const egressSubnets = egressSubnetCiderBlocks.map((cidrBlock, index) => {
		const nth = index + 1;
		const cfnEgressSubnet = new cdk.aws_ec2.CfnSubnet(
			scope,
			`${idWithHyphen}egress-subnet-${nth}`,
			{
				cidrBlock,
				availabilityZone: `${scope.region}${availabilityZones[index]}`,
				vpcId: vpc.vpcId,
				mapPublicIpOnLaunch: false,
			},
		);
		Tags.of(cfnEgressSubnet).add("Name", `${idWithHyphen}egress-subnet-${nth}`);

		return cfnEgressSubnet;
	});
	subnets.push(...egressSubnets);

	publicSubnets = subnets.filter((subnet) => subnet.mapPublicIpOnLaunch);
	privateSubnets = subnets.filter((subnet) => !subnet.mapPublicIpOnLaunch);

	return {
		ingressSubnets,
		applicationSubnets,
		dbSubnets,
		managementSubnets,
		egressSubnets,
		publicSubnets,
		privateSubnets,
		subnets,
	};
};

const associatePublicSubnetsToPublicRouteTable = (
	scope: CommonStack,
	idWithHyphen: string,
	publicSubnets: ec2.CfnSubnet[],
	publicRouteTable: ec2.CfnRouteTable,
) => {
	for (const subnet of publicSubnets) {
		new ec2.CfnSubnetRouteTableAssociation(
			scope,
			`${idWithHyphen}public-subnet-${subnet.toString()}-association`,
			{
				subnetId: subnet.ref,
				routeTableId: publicRouteTable.ref,
			},
		);
	}
};

const associateEgressSubnetsToEngressRouteTable = (
	scope: CommonStack,
	idWithHyphen: string,
	egressSubnets: ec2.CfnSubnet[],
	engressRouteTable: ec2.CfnRouteTable,
) => {
	for (const subnet of egressSubnets) {
		new ec2.CfnSubnetRouteTableAssociation(
			scope,
			`${idWithHyphen}engress-${subnet.toString()}-association`,
			{
				subnetId: subnet.ref,
				routeTableId: engressRouteTable.ref,
			},
		);
	}

	return engressRouteTable;
};

const createVpcEndpoints = (
	scope: CommonStack,
	idWithHyphen: string,
	vpc: ec2.Vpc,
	engressRouteTable: ec2.CfnRouteTable,
	egressSubnets: ec2.CfnSubnet[],
) => {
	const ecrDkrEndpoint = new ec2.CfnVPCEndpoint(
		scope,
		`${idWithHyphen}ecr-dkr-endpoint`,
		{
			vpcId: vpc.vpcId,
			serviceName: "com.amazonaws.ap-northeast-1.ecr.dkr",
			vpcEndpointType: "Interface",
			subnetIds: egressSubnets.map((subnet) => subnet.ref),
		},
	);
	Tags.of(ecrDkrEndpoint).add("Name", `${idWithHyphen}ecr-dkr-endpoint`);

	const ecrApiEndpoint = new ec2.CfnVPCEndpoint(
		scope,
		`${idWithHyphen}ecr-api-endpoint`,
		{
			vpcId: vpc.vpcId,
			serviceName: "com.amazonaws.ap-northeast-1.ecr.api",
			vpcEndpointType: "Interface",
			subnetIds: egressSubnets.map((subnet) => subnet.ref),
		},
	);
	Tags.of(ecrApiEndpoint).add("Name", `${idWithHyphen}ecr-api-endpoint`);

	const s3Endpoint = new ec2.CfnVPCEndpoint(
		scope,
		`${idWithHyphen}s3-endpoint`,
		{
			vpcId: vpc.vpcId,
			serviceName: "com.amazonaws.ap-northeast-1.s3",
			vpcEndpointType: "Gateway",
			routeTableIds: [engressRouteTable.ref],
		},
	);
	Tags.of(s3Endpoint).add("Name", `${idWithHyphen}s3-endpoint`);

	const logsEndpoint = new ec2.CfnVPCEndpoint(
		scope,
		`${idWithHyphen}logs-endpoint`,
		{
			vpcId: vpc.vpcId,
			serviceName: "com.amazonaws.ap-northeast-1.logs",
			vpcEndpointType: "Interface",
			subnetIds: egressSubnets.map((subnet) => subnet.ref),
		},
	);
	Tags.of(logsEndpoint).add("Name", `${idWithHyphen}logs-endpoint`);

	// 必要になったらアンコメント
	// const parameterStoreEndpoint = new ec2.CfnVPCEndpoint(
	// 	this,
	// 	`${idWithHyphen}parameter-store-endpoint`,
	// 	{
	// 		vpcId: vpc.vpcId,
	// 		serviceName: "com.amazonaws.ap-northeast-1.ssm",
	// 		vpcEndpointType: "Interface",
	// 		subnetIds: egressSubnets.map((subnet) => subnet.ref),
	// 	},
	// );
	// Tags.of(parameterStoreEndpoint).add(
	// 	"Name",
	// 	`${idWithHyphen}parameter-store-endpoint`,
	// );

	// 必要になったらアンコメント
	// const secretsManagerEndpoint = new ec2.CfnVPCEndpoint(
	// 	this,
	// 	`${idWithHyphen}secrets-manager-endpoint`,
	// 	{
	// 		vpcId: vpc.vpcId,
	// 		serviceName: "com.amazonaws.ap-northeast-1.secretsmanager",
	// 		vpcEndpointType: "Interface",
	// 		subnetIds: egressSubnets.map((subnet) => subnet.ref),
	// 	},
	// );
	// Tags.of(secretsManagerEndpoint).add(
	// 	"Name",
	// 	`${idWithHyphen}secrets-manager-endpoint`,
	// );

	return {
		ecrDkrEndpoint,
		ecrApiEndpoint,
		s3Endpoint,
		logsEndpoint,
		// parameterStoreEndpoint,
		// secretsManagerEndpoint,
	};
};

const createPublicLoadBalancerSecurityGroup = (
	scope: CommonStack,
	idWithHyphen: string,
	vpc: ec2.Vpc,
) => {
	const publicLoadBalancerSG = new ec2.SecurityGroup(
		scope,
		`${idWithHyphen}public-load-balancer-sg`,
		{
			vpc,
			securityGroupName: `${idWithHyphen}public-load-balancer-sg`,
		},
	);

	publicLoadBalancerSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
	Tags.of(publicLoadBalancerSG).add(
		"Name",
		`${idWithHyphen}public-load-balancer-sg`,
	);

	return publicLoadBalancerSG;
};

const createFargateServiceSecurityGroup = (
	scope: CommonStack,
	idWithHyphen: string,
	vpc: ec2.Vpc,
	publicLoadBalancerSG: ec2.SecurityGroup,
) => {
	const fargateServiceSG = new ec2.SecurityGroup(
		scope,
		`${idWithHyphen}fargate-service-sg`,
		{
			vpc,
			securityGroupName: `${idWithHyphen}fargate-service-sg`,
		},
	);

	fargateServiceSG.addIngressRule(publicLoadBalancerSG, ec2.Port.tcp(80));
	Tags.of(fargateServiceSG).add("Name", `${idWithHyphen}fargate-service-sg`);

	return fargateServiceSG;
};

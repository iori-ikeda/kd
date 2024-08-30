import type { Construct } from "constructs";
import type { Config } from "../config";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Tags } from "aws-cdk-lib";

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
			cidr: "10.0.0.0/16",
			vpcName: `${idWithHyphen}vpc`,
			subnetConfiguration: [],
		});

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

		// Ingress 用の public subnet を2つの AZ に作成する
		const ingressSubnetCiderBlocks = subnetCiderBlocks.splice(0, 2);
		const ingressSubnets = ingressSubnetCiderBlocks.map((cidrBlock, index) => {
			const nth = index + 1;
			const cfnIngressSubnet = new cdk.aws_ec2.CfnSubnet(
				this,
				`${idWithHyphen}ingress-subnet-${nth}`,
				{
					cidrBlock,
					availabilityZone: `${config.account.region}${availabilityZones[index]}`,
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
		// TODO: application 用の private with egress subnet を2つの AZ に作成する
		// TODO: db 用の private isolate subnet を2つの AZ に作成する
	}
}

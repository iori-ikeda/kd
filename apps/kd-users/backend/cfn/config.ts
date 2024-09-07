import type { EnvironmentVariables } from "./bin/cfn";

export const getConfig = (
	environmentVariables: EnvironmentVariables,
): Config => {
	const json = JSON.parse(environmentVariables.KD_USERS_CDK_CONFIG_JSON);

	return {
		env: environmentVariables.ENV,
		account: {
			id: json.account.id,
			region: json.account.region,
		},
		vpc: {
			id: json.vpc.id,
		},
		ecs: {
			taskDef: {
				cpu: json.ecs.taskDef.cpu,
				memoryMiB: json.ecs.taskDef.memoryMiB,
				container: {
					cpu: json.ecs.taskDef.container.cpu,
					memoryLimitMiB: json.ecs.taskDef.container.memoryLimitMiB,
					containerPort: json.ecs.taskDef.container.containerPort,
					hostPort: json.ecs.taskDef.container.hostPort,
					protocol: json.ecs.taskDef.container.protocol,
				},
			},
			fargateService: {
				securityGroupId: json.ecs.fargateService.securityGroupId,
				subnets: json.ecs.fargateService.subnets,
			},
		},
		route53: {
			zoneName: json.route53.zoneName,
		},
		alb: {
			domain: json.alb.domain,
			subnets: json.alb.subnets,
			securityGroupId: json.alb.securityGroupId,
			listener: json.alb.listener,
		},
		rds: {
			subnets: json.rds.subnets,
			securityGroupId: json.rds.securityGroupId,
			dbUser: json.rds.dbUser,
		},
	};
};

export interface Config {
	env: "dev" | "prod";
	account: AccountConfig;
	vpc: VpcConfig;
	ecs: EcsConfig;
	route53: Route53Config;
	alb: AlbConfig;
	rds: RdsConfig;
}

interface AccountConfig {
	id: string;
	region: string;
}

interface VpcConfig {
	id: string;
}

interface EcsConfig {
	taskDef: {
		cpu: string; // ecs.TaskDefinition の引数で string で渡す必要があるため
		memoryMiB: string; // ecs.TaskDefinition の引数で string で渡す必要があるため
		// TODO: support multiple containers
		container: {
			cpu: number;
			memoryLimitMiB: number;
			containerPort: number;
			hostPort: number;
			protocol: "tcp" | "udp";
		};
	};
	fargateService: {
		securityGroupId: string;
		subnets: Array<{
			subnetId: string;
			availabilityZone: string;
		}>;
	};
}

interface Route53Config {
	zoneName: string;
}

interface AlbConfig {
	domain: string; // route53 のドメイン名
	subnets: Array<{
		subnetId: string;
		availabilityZone: string;
	}>;
	securityGroupId: string;
	listener: AlbListenerConfig;
}

interface AlbListenerConfig {
	port: number;
	certificates: Array<{
		certificateArn: string;
	}>;
	targetGroups: Array<ListenerTargetGroupConfig>;
}

interface ListenerTargetGroupConfig {
	port: number;
	healthCheck: {
		path: string;
		healthyHttpCodes: string;
	};
}

interface RdsConfig {
	subnets: Array<{
		subnetId: string;
		availabilityZone: string;
	}>;
	securityGroupId: string;
	dbUser: string;
}

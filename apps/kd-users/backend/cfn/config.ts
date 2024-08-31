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
		},
	};
};

export interface Config {
	env: "dev" | "prod";
	account: AccountConfig;
	vpc: VpcConfig;
	ecs: EcsConfig;
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
		cpu: number;
		memoryMiB: number;
		// TODO: support multiple containers
		container: {
			cpu: number;
			memoryLimitMiB: number;
			containerPort: number;
			hostPort: number;
			protocol: "tcp" | "udp";
		};
	};
}

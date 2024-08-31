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
	};
};

export interface Config {
	env: "dev" | "prod";
	account: AccountConfig;
	vpc: VpcConfig;
}

interface AccountConfig {
	id: string;
	region: string;
}

interface VpcConfig {
	id: string;
}

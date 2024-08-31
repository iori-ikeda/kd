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
	};
};

export interface Config {
	env: "dev" | "prod";
	account: AccountConfig;
}

interface AccountConfig {
	id: string;
	region: string;
}

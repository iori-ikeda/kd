import type { EnvironmentVariables } from "./bin/common";

export const getConfig = (
	environmentVariables: EnvironmentVariables,
): Config => {
	const json = JSON.parse(environmentVariables.KD_COMMON_CDK_CONFIG_JSON);

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

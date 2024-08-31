import type { DevConfig } from "./config";
import type { EnvironmentVariables } from "./bin/cfn";

export const getDevConfig = (
	environmentVariables: EnvironmentVariables,
): DevConfig => {
	const json = JSON.parse(environmentVariables.KD_USERS_CDK_CONFIG_JSON);

	return {
		account: {
			id: json.account.id,
			region: json.account.region,
		},
	};
};

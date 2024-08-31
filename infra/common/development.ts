import type { DevConfig } from "./config";
import type { EnvironmentVariables } from "./bin/common";

export const getDevConfig = (
	environmentVariables: EnvironmentVariables,
): DevConfig => {
	const json = JSON.parse(environmentVariables.KD_COMMON_CDK_CONFIG_JSON);

	return {
		account: {
			id: json.account.id,
			region: json.account.region,
		},
	};
};

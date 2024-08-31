import type { ProdConfig } from "./config";
import type { EnvironmentVariables } from "./bin/common";

export const getProdConfig = (
	environmentVariables: EnvironmentVariables,
): ProdConfig => {
	const json = JSON.parse(environmentVariables.KD_COMMON_CDK_CONFIG_JSON);

	return {
		account: {
			id: json.account.id,
			region: json.account.region,
		},
	};
};

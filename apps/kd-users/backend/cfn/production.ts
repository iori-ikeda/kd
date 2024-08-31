import type { ProdConfig } from "./config";
import type { EnvironmentVariables } from "./bin/cfn";

export const getProdConfig = (
	environmentVariables: EnvironmentVariables,
): ProdConfig => {
	return {
		account: {
			id: environmentVariables.ACCOUNT_ID,
			region: environmentVariables.REGION,
		},
	};
};

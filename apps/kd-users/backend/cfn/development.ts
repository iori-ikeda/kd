import type { DevConfig } from "./config";
import type { EnvironmentVariables } from "./bin/cfn";

// define setDevconfig function
export const getDevConfig = (
	environmentVariables: EnvironmentVariables,
): DevConfig => {
	return {
		account: {
			id: environmentVariables.ACCOUNT_ID,
			region: environmentVariables.REGION,
		},
	};
};

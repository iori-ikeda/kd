import { DevConfig } from './config';
import { EnvironmentVariables } from './bin/common';

// define setDevconfig function
export const getDevConfig = (environmentVariables: EnvironmentVariables): DevConfig => {
    return {
        account: {
            id: environmentVariables.ACCOUNT_ID,
            region: environmentVariables.REGION,
        },
    }
}

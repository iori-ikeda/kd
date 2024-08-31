export interface Config {
	account: AccountConfig;
}

export interface DevConfig extends Config {}
export interface ProdConfig extends Config {}

interface AccountConfig {
	id: string;
	region: string;
}

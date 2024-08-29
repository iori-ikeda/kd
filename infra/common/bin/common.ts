#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CommonStack } from "../lib/common-stack";
import type { Config } from "../config";
import { getDevConfig } from "../development";
import { getProdConfig } from "../production";

export type EnvironmentVariables = {
	ENV: "dev" | "prod";
	ACCOUNT_ID: string;
	REGION: string;
};

const getEnvironmentVariables = (): EnvironmentVariables => {
	if (!process.env.KD_COMMON_ENV) throw new Error("KD_COMMON_ENV is not set");
	if (!process.env.ACCOUNT_ID) throw new Error("ACCOUNT_ID is not set");
	if (!process.env.REGION) throw new Error("REGION is not set");

	return {
		ENV: process.env.KD_COMMON_ENV as EnvironmentVariables["ENV"],
		ACCOUNT_ID: process.env.ACCOUNT_ID as EnvironmentVariables["ACCOUNT_ID"],
		REGION: process.env.REGION as EnvironmentVariables["REGION"],
	};
};

const getConfig = (environmentVariables: EnvironmentVariables): Config => {
	switch (environmentVariables.ENV) {
		case "dev":
			return getDevConfig(environmentVariables);
		case "prod":
			return getProdConfig(environmentVariables);
		default:
			throw new Error("Invalid environment");
	}
};

const initStack = () => {
	const environmentVariables = getEnvironmentVariables();
	const stackId = `kd-common-${environmentVariables.ENV}`;
	const config = getConfig(environmentVariables);
	const app = new cdk.App();
	new CommonStack(app, stackId, config, {
		env: {
			account: config.account.id,
			region: config.account.region,
		},
	});
	app.synth();
};

initStack();

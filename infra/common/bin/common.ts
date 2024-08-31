#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CommonStack } from "../lib/common-stack";
import { getConfig } from "../config";

export type EnvironmentVariables = {
	ENV: "dev" | "prod";
	ACCOUNT_ID: string;
	REGION: string;
	KD_COMMON_CDK_CONFIG_JSON: string;
};

const getEnvironmentVariables = (): EnvironmentVariables => {
	if (!process.env.KD_COMMON_ENV) throw new Error("KD_COMMON_ENV is not set");
	if (!process.env.ACCOUNT_ID) throw new Error("ACCOUNT_ID is not set");
	if (!process.env.REGION) throw new Error("REGION is not set");
	if (!process.env.KD_COMMON_CDK_CONFIG_JSON)
		throw new Error("KD_COMMON_CDK_CONFIG_JSON is not set");

	return {
		ENV: process.env.KD_COMMON_ENV as EnvironmentVariables["ENV"],
		ACCOUNT_ID: process.env.ACCOUNT_ID as EnvironmentVariables["ACCOUNT_ID"],
		REGION: process.env.REGION as EnvironmentVariables["REGION"],
		KD_COMMON_CDK_CONFIG_JSON: process.env
			.KD_COMMON_CDK_CONFIG_JSON as EnvironmentVariables["KD_COMMON_CDK_CONFIG_JSON"],
	};
};

const initStack = () => {
	const environmentVariables = getEnvironmentVariables();
	const stackId = `kd-common-${environmentVariables.ENV}`;
	const app = new cdk.App();
	const config = getConfig(environmentVariables);
	new CommonStack(app, stackId, config, {
		env: {
			account: config.account.id,
			region: config.account.region,
		},
	});
	app.synth();
};

initStack();

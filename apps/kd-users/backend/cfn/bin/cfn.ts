#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CfnStack } from "../lib/cfn-stack";
import { getConfig } from "../config";

export type EnvironmentVariables = {
	ENV: "dev" | "prod";
	KD_USERS_CDK_CONFIG_JSON: string;
};

const getEnvironmentVariables = (): EnvironmentVariables => {
	if (!process.env.KD_USERS_ENV) throw new Error("KD_USERS_ENV is not set");
	if (!process.env.KD_USERS_CDK_CONFIG_JSON)
		throw new Error("KD_USERS_CDK_CONFIG_JSON is not set");

	return {
		ENV: process.env.KD_USERS_ENV as EnvironmentVariables["ENV"],
		KD_USERS_CDK_CONFIG_JSON: process.env
			.KD_USERS_CDK_CONFIG_JSON as EnvironmentVariables["KD_USERS_CDK_CONFIG_JSON"],
	};
};

const initStack = () => {
	const environmentVariables = getEnvironmentVariables();
	const stackId = `kd-users-${environmentVariables.ENV}`;
	const config = getConfig(environmentVariables);
	const app = new cdk.App();
	new CfnStack(app, stackId, config, {
		env: {
			account: config.account.id,
			region: config.account.region,
		},
	});
	app.synth();
};

initStack();

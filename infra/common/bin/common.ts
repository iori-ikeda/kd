#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CommonStack } from '../lib/common-stack';
import { Config} from '../config';
import { devConfig } from '../development';
import { prodConfig } from '../production';

type Env = 'dev' | 'prod';

const getConfig = (env: Env): Config => {
  switch (env) {
    case 'dev':
      return devConfig;
    case 'prod':
      return prodConfig;
    default:
      throw new Error('Invalid environment');
  }
}

const initStack = () => {
  const env = process.env.KD_COMMON_ENV as Env | undefined;
  if (!env || !['dev', 'prod'].includes(env)) {
    throw new Error('Invalid environment');
  }
  const stackId = `kd-common-${env}`;
  const config = getConfig(env);
  const app = new cdk.App();
  new CommonStack(app, stackId, config,{
    env: {
      account: config.account.id,
      region: config.account.region,
    },
  });
  app.synth();
}

initStack();
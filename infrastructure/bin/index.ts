#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Config, getConfig } from '../lib/config/config'
import { NeptuneDatabaseStack } from '../lib/stacks/neptune-database-stack';
import { NeptuneNotebookStack } from '../lib/stacks/neptune-notebook-stack';
import { BaseStack } from '../lib/stacks/base-stack';
import { TweetLoaderStack } from '../lib/stacks/tweet-loader-stack';

const app = new cdk.App();
let environmentName = app.node.tryGetContext('config');

const config: Config = getConfig(environmentName, './config/');
const env  = { account: config.Deployment.AWSAccountID, region: config.Deployment.AWSRegion };

const baseStack = new BaseStack(app, `${config.Deployment.Prefix}-base-stack`, {
  env: env,
  deployment: config.Deployment,
  vpcConfig: config.Vpc,
  neptuneNotebookEfsConfig: config.NeptuneNotebookEfs,
  ecsClusterConfig: config.EcsCluster
});

const neptuneDatabaseStack = new NeptuneDatabaseStack(app, `${config.Deployment.Prefix}-neptune-database-stack`, { 
  env: env,
  deployment: config.Deployment,
  neptuneConfig: config.Neptune,
  vpc: baseStack.vpc
});

new NeptuneNotebookStack(app, `${config.Deployment.Prefix}-neptune-notebook-stack`, {
  env: env,
  deployment: config.Deployment,
  neptuneNotebookConfig: config.NeptuneNotebook,
  vpc: baseStack.vpc,
  neptuneCluster: neptuneDatabaseStack.cluster,
  databaseClientSecurityGroup: neptuneDatabaseStack.databaseClientSecurityGroup,
  efsClientSecurityGroup: baseStack.neptuneNotebookEfsClientSecurityGroup,
  efsFileSystemId: baseStack.neptuneNotebookEfsFileSystemId,
});

new TweetLoaderStack(app, `${config.Deployment.Prefix}-tweet-loader-stack`, {
  env: env,
  deployment: config.Deployment,
  tweetFirehoseConfig: config.TweetFirehose,
  ecsCluster: baseStack.ecsCluster,
  s3Bucket: baseStack.s3Bucket
});
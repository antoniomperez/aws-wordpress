#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipelines/pipeline-stack';

const app = new cdk.App();

new PipelineStack(app, 'PipelineTestStack', {
  env: {
    region: 'eu-central-1',
    account: app.node.tryGetContext('PipelineTestDeploymentAccount'),
  },
  repositoryOwner: 'antoniomperez',
  repositoryName: 'aws-wordpress',
  repositoryBranch: 'develop',
});

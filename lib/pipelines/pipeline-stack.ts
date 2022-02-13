import { Construct } from 'constructs';
import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import {
  CodeBuildAction,
  GitHubSourceAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';

interface PipelineStackProps extends StackProps {
  repositoryOwner: string;
  repositoryName: string;
  repositoryBranch: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: this.stackName,
      crossAccountKeys: false,
    });

    const sourceOutput = new Artifact('SourceOutput');

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          owner: props.repositoryOwner,
          repo: props.repositoryName,
          branch: props.repositoryBranch,
          actionName: 'Pipeline_Source',
          oauthToken: SecretValue.secretsManager('github-token'),
          output: sourceOutput,
        }),
      ],
    });

    const cdkBuildOutput = new Artifact('cdkBuildOutput');

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodeBuildAction({
          actionName: 'CDK_Build',
          input: sourceOutput,
          outputs: [cdkBuildOutput],
          project: new PipelineProject(this, 'CdkBuildProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromSourceFilename(
              `build-specs/${this.stackName}-build-spec-yml`
            ),
          }),
        }),
      ],
    });
  }
}

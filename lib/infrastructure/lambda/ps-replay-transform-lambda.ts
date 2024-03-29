import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Role } from "aws-cdk-lib/aws-iam";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import {
    DockerImageCode,
    DockerImageFunction,
    IFunction,
} from "aws-cdk-lib/aws-lambda";
import { PROD_STAGE } from "../../constants/stage-config";
import {
    PS_REPLAY_TRANSFORM_LAMBDA_ECR_PROD_TAG,
    PS_REPLAY_TRANSFORM_LAMBDA_ECR_DEV_TAG,
} from "../../constants/ecr-constants";

export interface PsReplayTransformLambdaProps {
    readonly ecrRepo: IRepository;
    readonly stageName: string;
    readonly teamsBucketName: string;
    readonly role: Role;
}

export class PsReplayTransformLambda extends Construct {
    readonly lambdaFunction: IFunction;

    constructor(
        scope: Construct,
        id: string,
        props: PsReplayTransformLambdaProps
    ) {
        super(scope, id);

        this.lambdaFunction = new DockerImageFunction(
            this,
            `PsReplayTransformLambda-${props.stageName}`,
            {
                functionName: `PsReplayTransformLambda-${props.stageName}`,
                description: "Transform replays to team information",
                code: DockerImageCode.fromEcr(props.ecrRepo, {
                    tagOrDigest:
                        props.stageName == PROD_STAGE
                            ? PS_REPLAY_TRANSFORM_LAMBDA_ECR_PROD_TAG
                            : PS_REPLAY_TRANSFORM_LAMBDA_ECR_DEV_TAG,
                }),
                timeout: Duration.minutes(5),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_WEEK,
                role: props.role,
                environment: {
                    TEAMS_BUCKET_NAME: props.teamsBucketName,
                },
            }
        );
    }
}

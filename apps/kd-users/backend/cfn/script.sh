PROFILE="private_ci_user"
REGION=$(aws configure get region --profile $PROFILE)
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE --region $REGION --query "Account" --output text)

aws ecr get-login-password --region $REGION --profile $PROFILE | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
docker build -t kd-users-prod . --platform linux/amd64
docker tag kd-users-prod $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/kd-users-prod-ecr-repository:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/kd-users-prod-ecr-repository:latest

VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=kd-common-prod-vpc" --query "Vpcs[0].VpcId" --output text --profile $PROFILE --region $REGION)
FARGATE_SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters "Name=tag:Name,Values=kd-common-prod-fargate-service-sg" --query "SecurityGroups[0].GroupId" --output text --profile $PROFILE --region $REGION)
FARGATE_SUBNET_ID_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-1" --query "Subnets[0].SubnetId" --output text --profile $PROFILE --region $REGION)
FARGATE_SUBNET_AZ_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-1" --query "Subnets[0].AvailabilityZone" --output text --profile $PROFILE --region $REGION)
FARGATE_SUBNET_ID_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-2" --query "Subnets[0].SubnetId" --output text --profile $PROFILE --region $REGION)
FARGATE_SUBNET_AZ_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-2" --query "Subnets[0].AvailabilityZone" --output text --profile $PROFILE --region $REGION)
ALB_SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters "Name=tag:Name,Values=kd-common-prod-public-load-balancer-sg" --query "SecurityGroups[0].GroupId" --output text --profile $PROFILE --region $REGION)
ALB_SUBNET_ID_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-1" --query "Subnets[0].SubnetId" --output text --profile $PROFILE --region $REGION)
ALB_SUBNET_AZ_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-1" --query "Subnets[0].AvailabilityZone" --output text --profile $PROFILE --region $REGION)
ALB_SUBNET_ID_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-2" --query "Subnets[0].SubnetId" --output text --profile $PROFILE --region $REGION)
ALB_SUBNET_AZ_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-2" --query "Subnets[0].AvailabilityZone" --output text --profile $PROFILE --region $REGION)
RDS_SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters "Name=tag:Name,Values=kd-common-prod-rds-sg" --query "SecurityGroups[0].GroupId" --output text --profile $PROFILE --region $REGION)
RDS_SUBNET_ID_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-1" --query "Subnets[0].SubnetId" --output text --profile $PROFILE --region $REGION)
RDS_SUBNET_AZ_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-1" --query "Subnets[0].AvailabilityZone" --output text --profile $PROFILE --region $REGION)
RDS_SUBNET_ID_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-2" --query "Subnets[0].SubnetId" --output text --profile $PROFILE --region $REGION)
RDS_SUBNET_AZ_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=kd-common-prod-ingress-subnet-2" --query "Subnets[0].AvailabilityZone" --output text --profile $PROFILE --region $REGION)

HOSTED_ZONE_NAME="kd-users-prod.com"
ZONE_NAME=$(aws route53 list-hosted-zones --profile $PROFILE --region $REGION --query "HostedZones[?Name == '$HOSTED_ZONE_NAME.'] | [0].Name" --output text)
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --profile $PROFILE --region $REGION --query "HostedZones[?Name == '$HOSTED_ZONE_NAME.'] | [0].Id" --output text | cut -d'/' -f3)
ALB_DOMAIN="api.kd-users-prod.com"
CERTIFICATE_ARN=$(aws acm list-certificates --profile $PROFILE --region $REGION --query "CertificateSummaryList[?DomainName == '$HOSTED_ZONE_NAME'] | [0].CertificateArn" --output text)

KD_USERS_CDK_CONFIG_JSON=$(jq -n \
  --arg account_id "$ACCOUNT_ID" \
  --arg region "$REGION" \
  --arg vpc_id "$VPC_ID" \
  --arg fargate_sg_id "$FARGATE_SECURITY_GROUP_ID" \
  --arg fargate_subnet1_id "$FARGATE_SUBNET_ID_1" \
  --arg fargate_subnet1_az "$FARGATE_SUBNET_AZ_1" \
  --arg fargate_subnet2_id "$FARGATE_SUBNET_ID_2" \
  --arg fargate_subnet2_az "$FARGATE_SUBNET_AZ_2" \
  --arg zone_name "$HOSTED_ZONE_NAME" \
  --arg hosted_zone_id "$HOSTED_ZONE_ID" \
  --arg alb_domain "$ALB_DOMAIN" \
  --arg alb_sg_id "$ALB_SECURITY_GROUP_ID" \
  --arg alb_subnet1_id "$ALB_SUBNET_ID_1" \
  --arg alb_subnet1_az "$ALB_SUBNET_AZ_1" \
  --arg alb_subnet2_id "$ALB_SUBNET_ID_2" \
  --arg alb_subnet2_az "$ALB_SUBNET_AZ_2" \
  --arg cert_arn "$CERTIFICATE_ARN" \
  --arg rds_sg_id "$RDS_SECURITY_GROUP_ID" \
  --arg rds_subnet1_id "$RDS_SUBNET_ID_1" \
  --arg rds_subnet1_az "$RDS_SUBNET_AZ_1" \
  --arg rds_subnet2_id "$RDS_SUBNET_ID_2" \
  --arg rds_subnet2_az "$RDS_SUBNET_AZ_2" \
  '{
    account: {
      id: $account_id,
      region: $region
    },
    vpc: {
      id: $vpc_id
    },
    ecs: {
      taskDef: {
        cpu: "256",
        memoryMiB: "512",
        container: {
          cpu: 256,
          memoryLimitMiB: 512,
          containerPort: 8080,
          hostPort: 8080,
          protocol: "tcp"
        }
      },
      fargateService: {
        securityGroupId: $fargate_sg_id,
        subnets: [
          {
            subnetId: $fargate_subnet1_id,
            availabilityZone: $fargate_subnet1_az
          },
          {
            subnetId: $fargate_subnet2_id,
            availabilityZone: $fargate_subnet2_az
          }
        ]
      }
    },
    route53: {
      zoneName: $zone_name,
      hostedZoneId: $hosted_zone_id
    },
    alb: {
      domain: $alb_domain,
      subnets: [
        {
          subnetId: $alb_subnet1_id,
          availabilityZone: $alb_subnet1_az
        },
        {
          subnetId: $alb_subnet2_id,
          availabilityZone: $alb_subnet2_az
        }
      ],
      securityGroupId: $alb_sg_id,
      listener: {
        port: 443,
        certificates: [
          {
            certificateArn: $cert_arn
          }
        ],
        targetGroups: [
          {
            port: 80,
            healthCheck: {
              path: "/health_check",
              healthyHttpCodes: "200"
            }
          }
        ]
      }
    },
    rds: {
      subnets: [
        {
          subnetId: $rds_subnet1_id,
          availabilityZone: $rds_subnet1_az
        },
        {
          subnetId: $rds_subnet2_id,
          availabilityZone: $rds_subnet2_az
        }
      ],
      securityGroupId: $rds_sg_id,
      dbUser: "kd_users_admin_desu"
    }
  }') KD_USERS_ENV=prod pnpm cdk deploy --profile $PROFILE
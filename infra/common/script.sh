PROFILE="private_ci_user"
REGION=$(aws configure get region --profile $PROFILE)
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE --region $REGION --query "Account" --output text)


KD_COMMON_CDK_CONFIG_JSON=$(jq -n \
  --arg account_id "$ACCOUNT_ID" \
  --arg region "$REGION" \
  '{
    "account": {
      "id": $account_id,
      "region": $region
    }
  }') KD_COMMON_ENV=prod pnpm cdk deploy --profile $PROFILE
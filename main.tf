# ====================================
#
# IMPORT From Infra State
# 
# ====================================   

data "terraform_remote_state" "infra" {
  backend = "s3"

  config = {
    bucket       = "alphadate-terraform-state"
    key          = "alphadate-infra-${var.environment}.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}

# ====================================
#
# DynamoDB
# 
# ====================================

module "dynamo_alphabets" {
  source = "./modules/dynamodb"

  app_name    = var.app_name
  environment = var.environment

  dynamo_table_name = "${var.app_name}-${var.environment}-alphabets"
  dynamo_pk         = "userId"
  dynamo_fk         = "dateId"
}

# ====================================
#
# Authorizers
# 
# ====================================

resource "aws_iam_policy" "lambda_authorizer_policy" {
  name        = "${var.app_name}-${var.environment}-lambda-authorizer-policy"
  description = "Allow Lambda to query DynamoDB user information"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "dynamodb:Query"
        Effect = "Allow"
        Sid    = ""
        Resource = [
          data.terraform_remote_state.infra.outputs.users_table_arn,
          "${data.terraform_remote_state.infra.outputs.users_table_arn}/index/cognitoId-index"
        ]
      },
    ]
  })
}

module "lambda-authorizer" {
  source = "./modules/lambda"

  app_name    = var.app_name
  environment = var.environment

  lambda_name        = "${var.app_name}-${var.environment}-lambda-authorizer"
  lambda_source_path = "src/interfaces/lambdas_authorizer/Authorizer"
  lambda_policy_arns = {
    "lambda-dynamodb" = aws_iam_policy.lambda_authorizer_policy.arn
  }
  lambda_environment_variables = {
    "USER_POOL_ID"     = data.terraform_remote_state.infra.outputs.cognito_pool_id
    "CLIENT_ID"        = data.terraform_remote_state.infra.outputs.cognito_client_id
    "ENVIRONMENT"      = var.environment
    "USERS_TABLE_NAME" = data.terraform_remote_state.infra.outputs.users_table_name
  }
}

# ====================================
#
# Api Gateway
# 
# ====================================

resource "aws_api_gateway_rest_api" "this" {
  name        = "${var.app_name}-${var.environment}-api"
  description = "Alphadate API"

  fail_on_warnings = true

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = var.environment
}

resource "aws_api_gateway_authorizer" "lambda" {
  name            = "${var.app_name}-${var.environment}-api-authorizer"
  rest_api_id     = aws_api_gateway_rest_api.this.id
  type            = "REQUEST"
  authorizer_uri  = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${module.lambda-authorizer.lambda_arn}/invocations"
  identity_source = "method.request.header.Authorization"
}

resource "aws_lambda_permission" "api-gateway-authorizer" {
  statement_id  = "AllowApiGatewayInvokeAuthorizer"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-authorizer.lambda_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.this.execution_arn}/authorizers/${aws_api_gateway_authorizer.lambda.id}"
}

# ====================================
#
# Api Gateway Resources
# 
# ====================================

# /alphabets
resource "aws_api_gateway_resource" "alphabets" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "alphabets"
}

# /alphabets/dates
resource "aws_api_gateway_resource" "alphabets_dates" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.alphabets.id
  path_part   = "dates"
}

# /alphabets/recommendations
resource "aws_api_gateway_resource" "alphabets_recommendations" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.alphabets.id
  path_part   = "recommendations"
}

# /alphabets/dates/{dateId}
resource "aws_api_gateway_resource" "alphabets_dates_date_id" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.alphabets_dates.id
  path_part   = "{dateId}"
}

# /health
resource "aws_api_gateway_resource" "check_health" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "health"
}

# ====================================
#
# Api Gateway Get Alphabet Dates
# 
# ====================================

resource "aws_iam_policy" "get_alphabet_dates" {
  name        = "${var.app_name}-${var.environment}-lambda-get-alphabet-dates-policy"
  description = "Allow Lambda to query DynamoDB alphabet dates"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "dynamodb:Query"
        Effect = "Allow"
        Sid    = ""
        Resource = [
          module.dynamo_alphabets.dynamo_table_arn,
        ]
      },
    ]
  })
}

module "lambda_get_alphabet_dates" {
  source = "./modules/lambda"

  app_name    = var.app_name
  environment = var.environment

  lambda_name        = "${var.app_name}-${var.environment}-lambda-get-alphabet-dates"
  lambda_source_path = "src/interfaces/lambdas/GetAlphabetDates"
  lambda_policy_arns = {
    "lambda-dynamodb" = aws_iam_policy.get_alphabet_dates.arn
  }
  lambda_environment_variables = {
    "ALPHABETS_TABLE_NAME" = module.dynamo_alphabets.dynamo_table_name
  }
}

module "api_gateway_lambda_resource_get_alphabet_dates" {
  source = "./modules/api_gateway_lambda_resource"

  app_name    = var.app_name
  environment = var.environment

  lambda_name       = module.lambda_get_alphabet_dates.lambda_name
  lambda_invoke_arn = module.lambda_get_alphabet_dates.lambda_invoke_arn

  api_gateway_rest_api_id            = aws_api_gateway_rest_api.this.id
  api_gateway_rest_api_execution_arn = aws_api_gateway_rest_api.this.execution_arn
  api_gateway_rest_api_resource_id   = aws_api_gateway_resource.alphabets_dates.id
  api_gateway_rest_api_method        = "GET"
  api_gateway_rest_api_authorization = "CUSTOM"
  api_gateway_rest_api_authorizer_id = aws_api_gateway_authorizer.lambda.id
}


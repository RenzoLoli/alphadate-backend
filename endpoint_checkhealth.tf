# ====================================
#
# Api Gateway Check-Health METHODS
# 
# ====================================

module "lambda_check_health" {
  source = "./modules/lambda"

  app_name    = var.app_name
  environment = var.environment

  lambda_name        = "${var.app_name}-${var.environment}-lambda-check-health"
  lambda_source_path = "src/interfaces/lambdas/CheckHealth"

  lambda_environment_variables = {}
  lambda_policy_arns           = {}
}

module "api_gateway_lambda_resource_check_health" {
  source = "./modules/api_gateway_lambda_resource"

  app_name    = var.app_name
  environment = var.environment

  lambda_name       = module.lambda_check_health.lambda_name
  lambda_invoke_arn = module.lambda_check_health.lambda_invoke_arn

  api_gateway_rest_api_id            = aws_api_gateway_rest_api.this.id
  api_gateway_rest_api_execution_arn = aws_api_gateway_rest_api.this.execution_arn
  api_gateway_rest_api_resource_id   = aws_api_gateway_resource.check_health.id
  api_gateway_rest_api_method        = "GET"
  api_gateway_rest_api_authorization = "NONE"
}


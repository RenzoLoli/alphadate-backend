resource "aws_lambda_permission" "this" {
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.api_gateway_rest_api_execution_arn}/*/*"
}

resource "aws_api_gateway_method" "this" {
  rest_api_id   = var.api_gateway_rest_api_id
  resource_id   = var.api_gateway_rest_api_resource_id
  http_method   = var.api_gateway_rest_api_method
  authorization = var.api_gateway_rest_api_authorization
  authorizer_id = var.api_gateway_rest_api_authorization == "CUSTOM" ? var.api_gateway_rest_api_authorizer_id : null
}

resource "aws_api_gateway_integration" "this" {
  rest_api_id             = var.api_gateway_rest_api_id
  resource_id             = var.api_gateway_rest_api_resource_id
  http_method             = aws_api_gateway_method.this.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn
  timeout_milliseconds    = 15000
}

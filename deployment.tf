
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.api_gateway_lambda_resource_check_health.api_gateway_integration,
    module.api_gateway_lambda_resource_create_alphabet_date.api_gateway_integration,
    module.api_gateway_lambda_resource_get_alphabet_dates.api_gateway_integration,
    module.api_gateway_lambda_resource_remove_alphabet_date.api_gateway_integration,
    module.api_gateway_lambda_resource_update_alphabet_date.api_gateway_integration,
    module.api_gateway_lambda_resource_get_global_alphabet_dates.api_gateway_integration
  ]
}


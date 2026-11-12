output "api_gateway_id" {
  value = aws_api_gateway_rest_api.this.id
}

output "api_gateway_stage_name" {
  value = aws_api_gateway_stage.this.stage_name
}

output "api_endpoint" {
  value = "https://${aws_api_gateway_rest_api.this.id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_stage.this.stage_name}"
}

output "global_alphabets_id" {
  value = var.global_alphabets_id
}

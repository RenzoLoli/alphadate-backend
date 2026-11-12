variable "app_name" {
  description = "Application name used to prefix resource names"
  type        = string
}

variable "environment" {
  description = "Environment name (DEV, TST, PRD)"
  type        = string
}

variable "lambda_name" {
  description = "Lambda function name"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Lambda function invoke ARN"
  type        = string
}

variable "api_gateway_rest_api_id" {
  description = "API Gateway Rest API ID"
  type        = string
}

variable "api_gateway_rest_api_execution_arn" {
  description = "API Gateway Rest API ARN"
  type        = string
}

variable "api_gateway_rest_api_resource_id" {
  description = "API Gateway Rest API Resource ID"
  type        = string
}

variable "api_gateway_rest_api_method" {
  description = "API Gateway Rest API Method"
  type        = string
}

variable "api_gateway_rest_api_authorization" {
  description = "API Gateway Rest API Authorization"
  type        = string
  default     = "NONE"
}

variable "api_gateway_rest_api_authorizer_id" {
  description = "API Gateway Rest API Authorizer ID"
  type        = string
  default     = null
}

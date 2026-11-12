variable "app_name" {
  description = "Application name used to prefix resource names"
  type        = string
}

variable "environment" {
  description = "Environment name (DEV, TST, PRD)"
  type        = string
}

variable "lambda_name" {
  description = "Resource Lambda name"
  type        = string
}

variable "lambda_source_path" {
  description = "Path to the lambda source code"
  type        = string
}

variable "lambda_environment_variables" {
  description = "Environment variables to pass to the lambda"
  type        = map(string)
  default     = {}
}

variable "lambda_policy_arns" {
  description = "Policy ARNs to attach to the lambda role"
  type        = map(string)
  default     = {}
}

variable "lambda_tags" {
  description = "Tags to apply to the lambda"
  type        = map(string)
  default     = {}
}

variable "vpc_subnet_ids" {
  description = "VPC Subnet IDs"
  type        = list(string)
  default     = []
}

variable "vpc_security_group_ids" {
  description = "VPC Security Group IDs"
  type        = list(string)
  default     = []
}

variable "log_retention_in_days" {
  description = "Log retention in days"
  type        = number
  default     = 14
}

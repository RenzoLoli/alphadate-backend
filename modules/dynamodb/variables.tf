variable "app_name" {
  description = "Application name used to prefix resource names"
  type        = string
}

variable "environment" {
  description = "Environment name (DEV, TST, PRD)"
  type        = string
}

variable "dynamo_table_name" {
  description = "DynamoDB table name"
  type        = string
}

variable "dynamo_pk" {
  description = "DynamoDB primary key"
  type        = string
}

variable "dynamo_fk" {
  description = "DynamoDB foreign key"
  type        = string
}

variable "dynamo_retention_in_days" {
  description = "DynamoDB retention in days"
  type        = number
  default     = 7
}

variable "dynamo_tags" {
  description = "DynamoDB tags"
  type        = map(string)
  default     = {}
}

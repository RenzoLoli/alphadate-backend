variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "alphadate"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "global_alphabets_id" {
  description = "Global Dates Identifier for DynamoDB"
  type        = string
  default     = "_GLOBAL_ALPHABET_DATES"
}

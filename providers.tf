terraform {
  required_version = ">= 1.5"

  backend "s3" {
    bucket       = "alphadate-terraform-state"
    region       = "us-east-1"
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.0.0"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "archive" {
}

locals {
  lambda_source_path = var.lambda_source_path
  dist_path          = "${local.lambda_source_path}/dist"

  build_watch = toset(concat(
    [for f in fileset("${path.root}/src", "**/*.ts") : "${path.root}/src/${f}"],
    ["${path.root}/package.json"],
  ))

}

resource "aws_iam_role" "this" {
  name = "${var.lambda_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "terraform_data" "build" {
  triggers_replace = {
    for p in local.build_watch : p => filesha256(p)
  }

  provisioner "local-exec" {
    command = "${path.module}/bundle_lambda.sh ${local.lambda_source_path} app.ts app.handler"
  }
}

data "archive_file" "this" {
  depends_on = [
    terraform_data.build
  ]

  type        = "zip"
  source_dir  = local.dist_path
  output_path = "${path.module}/dist/${var.lambda_name}.zip"
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.lambda_name}"
  retention_in_days = var.log_retention_in_days
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role = aws_iam_role.this.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_extra_permissions" {
  for_each = var.lambda_policy_arns

  role       = aws_iam_role.this.name
  policy_arn = each.value
}

resource "aws_lambda_function" "this" {
  function_name    = var.lambda_name
  filename         = data.archive_file.this.output_path
  role             = aws_iam_role.this.arn
  source_code_hash = data.archive_file.this.output_base64sha256
  handler          = "app.handler"
  runtime          = "nodejs22.x"
  timeout          = 16
  memory_size      = 512

  depends_on = [
    aws_cloudwatch_log_group.this,
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_extra_permissions
  ]

  dynamic "vpc_config" {
    for_each = (
      length(var.vpc_subnet_ids) > 0 &&
      length(var.vpc_security_group_ids) > 0
    ) ? [true] : []

    content {
      subnet_ids         = var.vpc_subnet_ids
      security_group_ids = var.vpc_security_group_ids
    }
  }

  environment {
    variables = var.lambda_environment_variables
  }

  tags = var.lambda_tags
}

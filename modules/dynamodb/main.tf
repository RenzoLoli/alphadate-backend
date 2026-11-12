resource "aws_dynamodb_table" "this" {
  name         = var.dynamo_table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = var.dynamo_pk
  range_key = var.dynamo_fk

  attribute {
    name = var.dynamo_pk
    type = "S"
  }

  attribute {
    name = var.dynamo_fk
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = var.dynamo_tags
}

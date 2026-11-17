resource "aws_sqs_queue" "order_created_dlq" {
  name                      = "order-created-dlq"
  message_retention_seconds = 1209600 # 14 days
}

resource "aws_sqs_queue" "order_created" {
  name                       = "order-created"
  visibility_timeout_seconds = 30
  receive_wait_time_seconds  = 10 # long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.order_created_dlq.arn
    maxReceiveCount     = 3
  })
}

output "order_created_queue_url" {
  value = aws_sqs_queue.order_created.url
}
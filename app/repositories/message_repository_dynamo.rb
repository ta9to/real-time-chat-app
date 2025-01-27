require 'aws-sdk-dynamodb'
require 'securerandom'
require_relative '../domains/message_domain'

class MessageRepositoryDynamo
  TABLE_NAME = ENV['MESSAGES_TABLE_NAME'] || 'Messages'

  def initialize
    @client = Aws::DynamoDB::Client.new
  end

  def list_messages(room_id:)
    resp = @client.query(
      table_name: TABLE_NAME,
      key_condition_expression: 'roomId = :r',
      expression_attribute_values: { ':r' => room_id.to_s }
    )

    resp.items.map do |item|
      MessageDomain.new(
        id: item['messageId'],
        room_id: item['roomId'],
        user_id: item['userId'],
        user_name: item['userName'],
        content: item['content'],
        created_at: item['createdAt']
      )
    end
  end

  def create_message(room_id:, user_id:, content:, user_name:)
    now = Time.now.utc.iso8601
    message_id = SecureRandom.uuid

    item = {
      'roomId'     => room_id.to_s,
      'messageId'  => message_id,
      'userId'     => user_id.to_s,
      'userName'   => user_name,
      'content'    => content,
      'createdAt'  => now
    }

    @client.put_item(table_name: TABLE_NAME, item: item)

    MessageDomain.new(
      id: message_id,
      room_id: room_id,
      user_id: user_id,
      user_name: user_name,
      content: content,
      created_at: now
    )
  end
end

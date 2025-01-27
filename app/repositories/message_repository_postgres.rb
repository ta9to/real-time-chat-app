require_relative '../domains/message_domain'

class MessageRepositoryPostgres
  def list_messages(room_id:)
    records = Message.includes(:user).where(room_id: room_id).order(:created_at)

    records.map do |record|
      MessageDomain.new(
        id: record.id,
        room_id: record.room_id,
        user_id: record.user_id,
        user_name: record.user.name,
        content: record.content,
        created_at: record.created_at
      )
    end
  end

  def create_message(room_id:, user_id:, content:, user_name:)
    # PostgreSQL実装ではActiveRecordのリレーションでuser_nameを持ってくるのでuser_name argは不要だが引数を合わせる
    record = Message.create!(
      room_id: room_id,
      user_id: user_id,
      content: content
    )

    MessageDomain.new(
      id: record.id,
      room_id: record.room_id,
      user_id: record.user_id,
      user_name: record.user.name,
      content: record.content,
      created_at: record.created_at
    )
  end
end

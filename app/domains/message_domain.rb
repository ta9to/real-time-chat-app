class MessageDomain
  attr_reader :id, :room_id, :user_id, :user_name, :content, :created_at

  def initialize(id:, room_id:, user_id:, user_name:, content:, created_at:)
    @id = id
    @room_id = room_id
    @user_id = user_id
    @user_name = user_name
    @content = content
    @created_at = created_at
  end
end

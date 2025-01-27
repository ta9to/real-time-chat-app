module MessageRepository
  def create_message(room_id:, user_id:, content:)
    raise NotImplementedError
  end

  def list_messages(room_id:)
    raise NotImplementedError
  end
end

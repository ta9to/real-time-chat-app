class MessagesController < ApplicationController
  before_action :require_login

  def index
    repo = MessageRepositoryFactory.build
    messages = repo.list_messages(room_id: params[:room_id])
    render json: messages.map { |msg| serialize_domain(msg) }
  end

  def create
    repo = MessageRepositoryFactory.build
    user = current_user
    begin
      domain_message = repo.create_message(
        room_id: params[:room_id],
        user_id: user.id,
        user_name: user.name,
        content: message_params[:content]
      )
      render json: serialize_domain(domain_message), status: :created
    rescue => e
      render json: { errors: [ e.message ] }, status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:message).permit(:content)
  end

  def serialize_domain(msg)
    {
      id: msg.id,
      room_id: msg.room_id,
      content: msg.content,
      created_at: msg.created_at,
      user: {
        id: msg.user_id,
        name: msg.user_name
      }
    }
  end
end

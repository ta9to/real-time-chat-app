class MessagesController < ApplicationController
  before_action :require_login
  
  def index
    messages = Message.all
    render json: messages
  end

  private

  def require_login
    unless logged_in?
      render json: { error: "You must be logged in" }, status: :unauthorized
    end
  end
end

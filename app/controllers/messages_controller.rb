class MessagesController < ApplicationController
  before_action :require_login
  
  def index
    messages = Message.all
    render json: messages
  end
end

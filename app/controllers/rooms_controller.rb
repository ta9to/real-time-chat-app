class RoomsController < ApplicationController
  def show_latest_or_create_general
    @room = Room.order(created_at: :asc).first
    if @room.nil?
      @room = Room.create!(name: "general")
    end
    redirect_to room_path(@room)
  end

  def show
    @room = Room.find(params[:id])
  end
end

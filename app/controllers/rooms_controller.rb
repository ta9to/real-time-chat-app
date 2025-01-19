class RoomsController < ApplicationController
  before_action :require_login
  before_action :set_room, only: [:show]

  def index
    @rooms = Room.all.order(:created_at)
    render json: @rooms.as_json(only: [:id, :name, :is_private])
  end

  def new
    @room = Room.new
    @users = User.all
  end

  def create
    respond_to do |format|
      format.json do
        @room = Room.new(room_params)
        if @room.save
          RoomUser.create!(room: @room, user: current_user)
          render json: { id: @room.id, name: @room.name }, status: :ok
        else
          render json: { errors: @room.errors.full_messages }, status: :unprocessable_entity
        end
      end

      format.html do
        @room = Room.new(room_params)
        if @room.save
          RoomUser.create!(room: @room, user: current_user)
          redirect_to @room, notice: "ルームを作成しました"
        else
          render :new
        end
      end
    end
  end

  def show_latest_or_create_general
    @room = Room.order(created_at: :asc).first
    if @room.nil?
      @room = Room.create!(name: "general")
    end
    redirect_to room_path(@room)
  end

  def show
    @room = Room.find(params[:id])
    @current_user_avatar_url = if current_user.avatar.attached?
                                 url_for(current_user.avatar)
                               else
                                 nil
                               end
    respond_to do |format|
      format.html { render :show }
      format.json do
        render json: @room.as_json(
          only: [:id, :name, :is_private],
        )
      end
    end
  end

  def invite
    @room = current_user.rooms.find(params[:id])
    user = User.find(params[:user_id])
    if @room.users.include?(user)
      redirect_to @room, alert: "#{user.name}は既に参加中です"
    else
      ru = RoomUser.create(room: @room, user: user)
      if ru.persisted?
        redirect_to @room, notice: "#{user.name}を招待しました"
      else
        redirect_to @room, alert: ru.errors.full_messages.join(", ")
      end
    end
  end

  def direct
    target_user = User.find(params[:user_id])
    if target_user == current_user
      render json: { error: "自分自身とはチャットできません" }, status: :unprocessable_entity
      return
    end

    @room = find_private_room_with(target_user)
    unless @room
      @room = Room.create!(name: "#{current_user.name} & #{target_user.name}", is_private: true)
      @room.room_users.create!(user: current_user)
      @room.room_users.create!(user: target_user)
    end

    render json: { id: @room.id, name: @room.name, is_private: @room.is_private }
  end

  private

  # 既存のprivate room (is_private=true) で、かつ
  # room_usersが自分 + target_user の2名だけのroomを探す
  def find_private_room_with(target_user)
    # current_userの属する部屋のうちprivateなものだけ
    rooms = current_user.rooms.where(is_private: true)

    rooms.find do |room|
      room.users.count == 2 && room.users.include?(target_user)
    end
  end

  def set_room
    @room = Room.find(params[:id])
  end

  def room_params
    # is_private は boolean, name は string
    params.require(:room).permit(:name, :is_private)
  end
end

class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update]

  def index
    users = User.all
    render json: users.as_json(only: [:id, :name, :status])
  end

  def show
  end

  def edit
  end

  def update
    user = current_user
    if user.update(user_params)
      user_avatar_url = if user.avatar.attached?
        url_for(user.avatar)
      else
        nil
      end
      render json: user
        .as_json(only: [:id, :name, :status])
        .merge(avatar_url: user_avatar_url)
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  # strong parameters -> ${resourceName}_params クライアントから送信されてくる値のうちデータの作成、更新を許可するパラメータを指定できる
  def user_params
    params.require(:user).permit(:status, :avatar)
  end
end

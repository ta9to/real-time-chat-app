class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update]

  def show
  end

  def edit
  end

  def update
    if @user.update(user_params)
      redirect_to @user, notice: "プロフィールを更新しました。"
    else
      flash.now[:alert] = "プロフィールの更新に失敗しました。"
      render :edit
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

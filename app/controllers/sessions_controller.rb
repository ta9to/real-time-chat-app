class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_by(email: params[:session][:email])

    # ユーザが存在し、かつパスワード認証が通れば
    if user && user.authenticate(params[:session][:password])
      session[:user_id] = user.id
      redirect_to root_path, notice: 'ログインに成功しました'
    else
      flash.now[:alert] = 'Email またはパスワードが正しくありません'
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to login_path, notice: 'ログアウトしました'
  end
end

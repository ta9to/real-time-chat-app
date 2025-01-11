class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_by(email: params[:session][:email])

    # ユーザが存在し、かつパスワード認証が通れば
    if user && user.authenticate(params[:session][:password])
      session[:user_id] = user.id
      redirect_to root_path, notice: "ログインに成功しました"
    else
      flash.now[:alert] = "Email またはパスワードが正しくありません"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to login_path, notice: "ログアウトしました"
  end

  def omniauth
    user = User.find_or_create_by(provider: auth_hash[:provider], uid: auth_hash[:uid]) do |u|
      u.name = auth_hash[:info][:name]
      u.email = auth_hash[:info][:email]
      u.password_digest = auth_hash[:credentials][:token]
    end

    Rails.logger.debug(user)
    if user.persisted?
      session[:user_id] = user.id
      redirect_to root_path, notice: "ログインしました"
    else
      redirect_to login_path, alert: "ログインに失敗しました"
    end
  end

  private

  def auth_hash
    request.env["omniauth.auth"]
  end
end

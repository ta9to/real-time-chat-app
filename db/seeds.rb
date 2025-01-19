# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

require 'faker'

10.times do
  User.create!(
    name: Faker::Name.name,                        # ランダム名前
    email: Faker::Internet.unique.email,           # メールアドレス
    password: "password",                          # has_secure_password用
    provider: "local",                             # 一旦仮に 'local' とする
    uid: SecureRandom.uuid,                        # 一意なUIDを付与
    status: User.statuses.keys.sample             # enum: ["offline", "coding", "busy", "away"] からランダム
  )
end

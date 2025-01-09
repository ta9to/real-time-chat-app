class User < ApplicationRecord
  has_secure_password

  has_many :room_users, dependent: :destroy
  has_many :rooms, through: :room_users
  has_many :messages, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
end

class User < ApplicationRecord
  has_secure_password
  has_one_attached :avatar

  has_many :room_users, dependent: :destroy
  has_many :rooms, through: :room_users
  has_many :messages, dependent: :destroy

  validates :provider, :uid, presence: true
  validates :status, length: { maximum: 50 }
end

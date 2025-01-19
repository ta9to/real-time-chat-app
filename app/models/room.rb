class Room < ApplicationRecord
  has_many :room_users, dependent: :destroy
  has_many :users, through: :room_users
  has_many :messages, dependent: :destroy

  validates :name, presence: true
  validates :max_members, numericality: { only_integer: true, greater_than: 1 }
end

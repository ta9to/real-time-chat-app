class RoomUser < ApplicationRecord
  belongs_to :user
  belongs_to :room

  validates :user_id, uniqueness: { scope: :room_id }
  validate :check_room_limit

  def check_room_limit
    if room.room_users.count >= room.max_members
      errors.add(:base, "上限（#{room.max_members}名）に達しています。")
    end
    if room.is_private? && room.room_users.count >= 2
      errors.add(:base, "1対1チャットは2人までです。")
    end
  end
end

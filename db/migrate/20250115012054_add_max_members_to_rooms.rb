class AddMaxMembersToRooms < ActiveRecord::Migration[7.2]
  def change
    add_column :rooms, :max_members, :integer, default: 100
  end
end

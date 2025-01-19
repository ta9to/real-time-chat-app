class AddIsPrivateToRooms < ActiveRecord::Migration[7.2]
  def change
    add_column :rooms, :is_private, :boolean, default: false, null: false
  end
end

class AddOwnerIdToRooms < ActiveRecord::Migration[7.2]
  def change
    add_column :rooms, :owner_id, :integer
  end
end

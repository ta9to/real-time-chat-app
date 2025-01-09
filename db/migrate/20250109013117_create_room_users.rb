class CreateRoomUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :room_users do |t|
      t.references :user, null: false, foreign_key: true
      t.references :room, null: false, foreign_key: true
      t.timestamps
    end
    add_index :room_users, [ :user_id, :room_id ], unique: true
  end
end

class CreateMembers < ActiveRecord::Migration
  def change
    create_table :members do |t|
    	t.string :name
      t.string :color

      t.timestamps
    end
  end
end

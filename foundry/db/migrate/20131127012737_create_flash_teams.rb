class CreateFlashTeams < ActiveRecord::Migration
  def change
    create_table :flash_teams do |t|
      t.string :name

      t.timestamps
    end
  end
end

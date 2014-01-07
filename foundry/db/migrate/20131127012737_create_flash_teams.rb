class CreateFlashTeams < ActiveRecord::Migration
  def change
    create_table :flash_teams do |t|
      t.string :name
      t.text :json
      t.text :status

      t.timestamps
    end
  end
end

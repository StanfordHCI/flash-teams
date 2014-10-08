class FlashTeam < ActiveRecord::Base
  validates :name, presence: true
  validates :author, presence: true

  belongs_to :user
  
  has_many :tasks
  has_many :members
end

def get_all_flash_teams
  return FlashTeam.all
end
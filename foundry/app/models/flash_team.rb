class FlashTeam < ActiveRecord::Base
  validates :name, presence: true

  has_many :tasks
  has_many :members
end

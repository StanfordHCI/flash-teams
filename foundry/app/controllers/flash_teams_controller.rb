require 'json'
require 'securerandom'

class FlashTeamsController < ApplicationController
  helper_method :get_tasks

	def new
    @flash_team = FlashTeam.new
  end

  def create
    @flash_team = FlashTeam.new(flash_team_params)

    if @flash_team.save
      redirect_to @flash_team
    else
      render 'new'
    end
  end

  def show
    @flash_team = FlashTeam.find(params[:id])
  end

  def index
    @flash_teams = FlashTeam.all
  end

  def edit
    @flash_team = FlashTeam.find(params[:id])
  end

  def update
    @flash_team = FlashTeam.find(params[:id])

    if @flash_team.update(flash_team_params)
      redirect_to @flash_team
    else
      render 'edit'
    end
  end

  def destroy
    @flash_team = FlashTeam.find(params[:id])
    @flash_team.destroy

    redirect_to flash_teams_path
  end

  def ajax_update
    @flash_team = FlashTeam.find(params[:id])
    @flash_team.json = 0
    @flash_team.save
  end

  def get_status
    @flash_team = FlashTeam.find(params[:id])
    respond_to do |format|
      format.json {render json: @flash_team.status, status: :ok}
    end
  end

  def update_status
    status = params[:localStatusJSON]
    @flash_team = FlashTeam.find(params[:id])
    @flash_team.status = status
    @flash_team.save

    respond_to do |format|
      format.json {render json: "saved".to_json, status: :ok}
    end
  end

  def update_json
    json = params[:flashTeamJSON]
    @flash_team = FlashTeam.find(params[:id])
    @flash_team.json = json
    @flash_team.save

    respond_to do |format|
      format.json {render json: "saved".to_json, status: :ok}
    end
  end

  def get_json
    @flash_team = FlashTeam.find(params[:id])
    status_hashmap = JSON.parse(@flash_team.status)
    puts "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! " + status_hashmap["flash_teams_json"].to_json
    respond_to do |format|
      format.json {render json: status_hashmap["flash_teams_json"].to_json, status: :ok}
    end
  end

  def flash_team_params
    params.require(:flash_team).permit(:name, :json)
  end

  private :flash_team_params
end
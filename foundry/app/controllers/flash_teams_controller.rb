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
    #customize user views
    status = @flash_team.status 
    if status == nil
      @author_runtime=false
    else
      json_status= JSON.parse(status)
      if json_status["flash_team_in_progress"] == nil
        @author_runtime=false
      else
        @author_runtime=json_status["flash_team_in_progress"]
      end
    end

    if params.has_key?("uniq")
     @in_expert_view = true
     @in_author_view = false
    else
     @in_expert_view = false
     @in_author_view = true
    end
    #end
   
    #show flash team title
    if json_status.blank?
       @flash_team_title = "New Flash Team" 
    else
      flash_team_json = json_status["flash_teams_json"]
      @flash_team_title = flash_team_json["title"] 
    end
    #end
   

    flash_teams = FlashTeam.all
    @events_array = []
    flash_teams.each do |flash_team|
      next if flash_team.json.blank?
      flash_team_json = JSON.parse(flash_team.json)
      flash_team_events = flash_team_json["events"]
      flash_team_events.each do |flash_team_event|
        @events_array << flash_team_event
      end
    end
    @events_json = @events_array.to_json
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
    respond_to do |format|
      format.json {render json: @flash_team.json, status: :ok}
    end
  end


  def flash_team_params
    params.require(:flash_team).permit(:name, :json)
  end

  private :flash_team_params
end
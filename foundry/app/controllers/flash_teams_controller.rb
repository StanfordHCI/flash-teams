require 'json'
require 'SecureRandom'

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

  def invite
    uuid = SecureRandom.uuid

    # generate unique id and add to url below
    url = url_for :action => 'edit', :id => params[:id], :u => uuid, :escape => false
    
    #UserMailer.send_email(email, url).deliver

    respond_to do |format|
      format.json {render json: url.to_json, status: :ok}
    end
  end

  def login
    uniq = params[:uniq]
    member = Member.where(:uniq => uniq, :email_confirmed => true)[0]
    if member != nil then
      session[:uniq] = uniq
      
      respond_to do |format|
        format.json {render json: member.email.to_json, status: :ok}
      end
    else
      respond_to do |format|
        format.json {render json: nil, status: :ok}
      end
    end
  end

  def check_email_confirmed
    uniq = params[:uniq]
    member = Member.where(:uniq => uniq)[0]
    if member != nil then
      if member.email_confirmed then
        respond_to do |format|
          format.json {render json: member.email.to_json, status: :ok}
        end
      else
        respond_to do |format|
          format.json {render json: nil, status: :ok}
        end
      end
    else
      respond_to do |format|
        format.json {render json: nil, status: :ok}
      end
    end
  end

  def confirm_email
    uniq = params[:uniq]
    confirm_email_uniq = params[:confirm_email_uniq]
    member = Member.where(:uniq => uniq, :confirm_email_uniq => confirm_email_uniq)[0]
    member.email_confirmed = true
    member.save

    respond_to do |format|
      format.json {render json: member.email.to_json, status: :ok}
    end
  end

  def send_confirmation_email
    name = params[:name]
    email = params[:email]
    uniq = params[:uniq]
    confirm_email_uniq = SecureRandom.uuid
    url = url_for :action => 'edit', :id => params[:id], :u => uniq, :cu => confirm_email_uniq, :escape => false
    UserMailer.send_confirmation_email(email, url).deliver

    # store email, uniq and confirm_email_uniq in db
    member = Member.create(:name => name, :email => email, :uniq => uniq, :confirm_email_uniq => confirm_email_uniq)

    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end

  def flash_team_params
    params.require(:flash_team).permit(:name, :json)
  end

  private :flash_team_params
end
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
      format.json {render json: nil, status: :ok}
    end
  end

  def invite
    uuid = SecureRandom.uuid

    # generate unique id and add to url below
           
    url = url_for :action => 'edit', :id => params[:id], :uniq => uuid, :escape => false
    
    #UserMailer.send_email(email, url).deliver

    respond_to do |format|
      format.json {render json: url.to_json, status: :ok}
    end
  end

  def login
    uniq = params[:uniq]
    session[:uniq] = uniq

    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end

  def confirm_email
    email = params[:email]
    uniq = params[:uniq]
    url = url_for :action => 'edit', :id => params[:id], :uniq => uniq, :email => email, :escape => false
    UserMailer.send_confirmation_email(email, url).deliver

    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end

  def early_completion_email
    email = params[:email]
    minutes = params[:minutes];
   
    UserMailer.send_early_completion_email(email,minutes).deliver
    #NOTE: Rename ‘send_confirmation_email’ above to your method name. It may/may not have arguments, depends on how you defined your method. The ‘deliver’ at the end is what actually sends the email.
    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end

  def before_task_starts_email
    email = params[:email]
    minutes = params[:minutes];
    # IMPORTANT
    UserMailer.send_before_task_starts_email(email,minutes).deliver
    
    #NOTE: Rename ‘send_confirmation_email’ above to your method name. It may/may not have arguments, depends on how you defined your method. The ‘deliver’ at the end is what actually sends the email.
    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end


  def task_delayed_email
    email = params[:email]
    
    UserMailer.send_task_delayed_email(email).deliver
    
    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end
  
  def delayed_task_finished_email
    email = params[:email]
    minutes = params[:minutes]
      
    UserMailer.send_delayed_task_finished_email(email,minutes).deliver
    
    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end
  
  #renders the delay form that the DRI has to fill out
  def delay
    @id_team = params[:id_team]

    @action_link="/flash_teams/"+params[:id_team]+"/"+params[:event_id]+"/get_delay"
  end  


  def get_delay
    @delay_estimation = params[:q]
    event_id=params[:event_id]
    event_id=event_id.to_f-1
    
    flash_team = FlashTeam.find(params[:id_team])

      if flash_team.notification_email_status != nil
        notification_email_status = JSON.parse(flash_team.notification_email_status)
      else
        notification_email_status = []
      end
      notification_email_status[event_id.to_f] = true;
      flash_team.notification_email_status = JSON.dump(notification_email_status)
      flash_team.save

      flash_team_status = JSON.parse(flash_team.status)
      flash_team_json=flash_team_status["flash_teams_json"]
      flash_team_members=flash_team_json["members"]
      flash_team_events=flash_team_json["events"]
    
      #TODO dri is now the first member. 
      dri_role=flash_team_events[event_id.to_f]["members"][0]
      event_name= flash_team_events[event_id.to_f]["title"]

      #TODO use email address instead of member role
      flash_team_members.each do |member|
        UserMailer.send_task_delayed_email(member["role"],@delay_estimation,event_name,dri_role).deliver
      end
  end

  def flash_team_params
    params.require(:flash_team).permit(:name, :json)
  end

  private :flash_team_params
end
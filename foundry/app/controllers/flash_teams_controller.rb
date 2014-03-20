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

  def early_completion_email
    uniq = params[:uniq]
    minutes = params[:minutes]

    email = Member.where(:uniq => uniq)[0].email
    if email
      UserMailer.send_early_completion_email(email,minutes).deliver
    end

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
 
  def delayed_task_finished_email
    uniq = params[:uniq]
    minutes = params[:minutes]
    title = params[:title]
    
    email = Member.where(:uniq => uniq)[0].email
    UserMailer.send_delayed_task_finished_email(email,minutes,title).deliver
    
    respond_to do |format|
      format.json {render json: nil, status: :ok}
    end
  end
  
  #renders the delay form that the DRI has to fill out
  def delay
    @id_team = params[:id]

    @action_link="/flash_teams/"+params[:id]+"/"+params[:event_id]+"/get_delay"
  end  


  def get_delay
    event_id=params[:event_id]
    event_id=event_id.to_f-1

    #dri_estimation = params[:q] 
    flash_team = FlashTeam.find(params[:id_team])
    #flash_team_status = JSON.parse(flash_team.status)
    #delayed_tasks_time=flash_team_status["delayed_tasks_time"]
    #delay_start_time = delayed_tasks_time[event_id]
    #delay_start_time = delay_start_time / 60

    #@delay_estimation = dri_estimation + delay_start_time
    @delay_estimation = params[:q]

      if flash_team.notification_email_status != nil
        notification_email_status = JSON.parse(flash_team.notification_email_status)
      else
        notification_email_status = []
      end
      notification_email_status[event_id.to_f+1] = true;
      flash_team.notification_email_status = JSON.dump(notification_email_status)
      flash_team.save

      flash_team_status = JSON.parse(flash_team.status)
      flash_team_json=flash_team_status["flash_teams_json"]
      flash_team_members=flash_team_json["members"]
      flash_team_events=flash_team_json["events"]
    
      #dri_role=flash_team_events[event_id.to_f]["members"][0]
      dri =  flash_team_events[event_id.to_f]["dri"]
      dri_member= flash_team_members.detect{|m| m["id"] == dri.to_i}
      if dri_member  == nil
        puts "dri is not defined"
        dri_member= flash_team_members.detect{|m| m["role"] == flash_team_events[event_id.to_f]["members"][0]["name"]}
      end
      dri_role=dri_member["role"]
      event_name= flash_team_events[event_id.to_f]["title"]
      flash_team_members.each do |member|
          #tmp_member= flash_team_members.detect{|m| m["role"] == member["role"]}
          #member_id= tmp_member["id"]
          uniq = member["uniq"]
          email = Member.where(:uniq => uniq)[0].email
          UserMailer.send_task_delayed_email(email,@delay_estimation,event_name,dri_role).deliver
       
      end
  end

  def get_user_name
     
     uniq=""
     if params[:uniq] != ""
       uniq = params[:uniq]
      member = Member.where(:uniq => uniq)[0]
    
      user_name = member.name
      user_role="" 
     else
        user_name="Daniela"
        user_role="Author"
     end

     respond_to do |format|
      format.json {render json: {:user_name => user_name, :user_role => user_role, :uniq => uniq}.to_json, status: :ok}
    end
  end

  def flash_team_params
    params.require(:flash_team).permit(:name, :json)
  end

  private :flash_team_params
end
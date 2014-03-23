class UserMailer < ActionMailer::Base
  default from: "jayhp9@stanford.edu"
 
  def send_early_completion_email(email,minutes)
  	  @minutes=minutes
  	  mail(:to => email, :subject => 'Flash Teams: Your next upcoming task starts '+ minutes +' minutes early')
  	   
  end
  
  def send_before_task_starts_email(email,minutes)
  	  @minutes=minutes
  	  mail(:to => email, :subject => 'Flash Teams: Your task starts in '+minutes+' minutes')
  end

  def send_task_delayed_email(email,delay_estimation,event_name,dri_role)
    @event_name = event_name
    @dri_role = dri_role
    @delay_estimation = delay_estimation
  	mail(:to => email, :subject => 'Flash Teams: The team is running '+delay_estimation+' behind schedule')
  end
  
  def send_delayed_dri_not_responded(email,event_name,dri_role)
    
    @event_name = event_name
    @dri_role = dri_role
    mail(:to => email, :subject => 'Flash Teams: '+ event_name +'is not finished on time')
  end

  def send_delayed_task_finished_email(email,minutes,title)
  	  @minutes=minutes
      @title = title
  	  mail(:to => email, :subject => 'Flash Teams: '+title+' is finished')
  end


  def send_confirmation_email(email_address, url)
  	@url = url
    mail(:to => email_address, :subject => 'Flash Teams: Please confirm your email address')
  end

  #action is called in scheduler.rb
  def send_dri_on_delay_email(email,event_name, dri_role,url,team_id,event_id,cc_emails)
      @event_name=event_name
      @dri_role=dri_role
      @minutes="10"
      @url=url
      #@url="/flash_teams/"+team_id+"/"+event_id+"/delay"

      #@url2 =  url_for :controller => 'FlashTeamsController', :team_id => team_id ,:event_id => event_id , :action => 'delay'

      mail(:to => email, :cc => cc_emails, :subject => 'Flash Teams: '+ event_name +' run by ' + dri_role +' is running late')
       
  end
end
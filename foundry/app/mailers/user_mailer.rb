class UserMailer < ActionMailer::Base
  default from: "jayhp9@stanford.edu"
 
  def send_early_completion_email(email,minutes)
  	  @minutes=minutes
  	  mail(:to => email, :subject => 'Flash Teams: Your next upcoming task starts'+ minutes +'minutes early')
  	   
  end
  
  def send_before_task_starts_email(email,minutes)
  	  @minutes=minutes
  	  mail(:to => email, :subject => 'Flash Teams: Your task starts in '+minutes+' minutes')
  end

  def send_task_delayed_email(email)
  
  	  mail(:to => email, :subject => 'Flash Teams: Your next upcoming task will not start on time')
  end
  
  def send_delayed_task_finished_email(email,minutes)
  	  @minutes=minutes
  	  mail(:to => email, :subject => 'Flash Teams: The delayed task is finished')
  end


  def send_confirmation_email(email_address, url)
  	@url = url
    mail(:to => email_address, :subject => 'Flash Teams: Please confirm your email address')
  end
end
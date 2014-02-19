class UserMailer < ActionMailer::Base
  default from: "jayhp9@stanford.edu"
 
  def send_early_completion_email(email,minutes)
  	  @minutes=minutes
  	  mail(:to => email, :subject => 'Flash Teams: A Task has been completed '+minutes+' minutes early')
  	   
  end
  
  def send_confirmation_email(email_address, url)
  	@url = url
    mail(:to => email_address, :subject => 'Flash Teams: Please confirm your email address')
  end
end
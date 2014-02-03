class UserMailer < ActionMailer::Base
  default from: "jayhp9@stanford.edu"

  def send_confirmation_email(email_address, url)
  	@url = url
    mail(:to => email_address, :subject => 'Flash Teams: Please confirm your email address')
  end
end
class UserMailer < ActionMailer::Base
  default from: "jayhp9@stanford.edu"

  def send_email(email_address)
    mail(:to => email_address, :subject => 'Test email from flash teams')
  end
end

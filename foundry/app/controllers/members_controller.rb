require 'json'

class MembersController < ApplicationController
  def invite
    uuid = SecureRandom.uuid

    # generate unique id and add to url below
    url = url_for :action => 'invited', :id => params[:id], :uniq => uuid
    
    #UserMailer.send_email(email, url).deliver

    respond_to do |format|
      format.json {render json: {:url => url, :uniq => uuid}.to_json, status: :ok}
    end
  end

  def invited
  	@uniq = params[:uniq]
  	@id = params[:id]
  	if not @uniq
  		render 'error'
  	end

  	# already confirmed email, so log in user and redirect to flash team page
  	if check_email_confirmed(@uniq)
  		login(uniq)
  	end
  end

  def confirm_email
    uniq = params[:u]
    confirm_email_uniq = params[:cu]
    member = Member.where(:uniq => uniq, :confirm_email_uniq => confirm_email_uniq)[0]
    member.email_confirmed = true
    member.save

    login(uniq)
  end

  def login uniq
  	session[:uniq] = uniq
  	redirect_to :controller => 'flash_teams', :action => 'edit', :id => params[:id], :notice => "You've been logged in!"
  end

  def check_email_confirmed uniq
    member = Member.where(:uniq => uniq)[0]
    (member != nil and member.email_confirmed)
  end

  def register
    name = params[:name]
    email = params[:email]
    uniq = params[:uniq]
    confirm_email_uniq = SecureRandom.uuid
    
    # store email, uniq and confirm_email_uniq in db
    member = Member.create(:name => name, :email => email, :uniq => uniq, :confirm_email_uniq => confirm_email_uniq)

    # send confirmation email
    url = url_for :action => 'confirm_email', :id => params[:id], :u => uniq, :cu => confirm_email_uniq
    UserMailer.send_confirmation_email(email, url).deliver
  end
end
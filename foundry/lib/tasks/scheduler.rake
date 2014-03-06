require 'json'
require 'socket'

namespace :notification do
  desc "Send notification emails when a task is delayed."
  task email_delayed_task: :environment do
   
   include ActionDispatch::Routing::UrlFor
   #include ActionController::UrlFor  #requires a request object
   include Rails.application.routes.url_helpers

    puts "checking if a task is delayed..."

    #script should be scheduled to run every call_period seconds
    call_period= 5 * 60 #seconds
    cur_time= (Time.now.to_f * 1000).to_i
         
    flash_teams = FlashTeam.all
   	flash_teams.each do |flash_team|
      next if flash_team.status == nil

      flash_team_status = JSON.parse(flash_team.status)
           	
      flash_team_json=flash_team_status["flash_teams_json"]
      flash_team_members=flash_team_json["members"]
      print members
      delayed_tasks_time=flash_team_status["delayed_tasks_time"]
      #dri_responded=flash_team_status["dri_responded"]
      if flash_team.notification_email_status != nil
        notification_email_status = JSON.parse(flash_team.notification_email_status)
      else
        notification_email_status=[]
      end
   
      flash_team_events=flash_team_json["events"]
      delayed_tasks_num=flash_team_status["delayed_tasks"]
      print "Checking flash team number: "
      print flash_team_json["id"]
      puts "\n"
      
      /get index of delayed event in events array/
      
      delayed_tasks_num.each do |groupNum|
        
        start_time= delayed_tasks_time[groupNum]
        delta_time_sec= (cur_time - start_time)/1000

        print delta_time_sec 

        if delta_time_sec<=call_period
          flash_team_events.each do |event|
            eventId = event["id"];
            if eventId == groupNum
              /send email to dri/
              delayed_event=event
              /TODO considered the first member is the dri for now. Change this when dri feature is added/
              /print flash_team_json["events"][0]["dri"]/
              if delayed_event["members"].length == 0
                print "error: delayed event has no members\n"
                break
              end
              dri =  delayed_event["members"][0]
              /TODO get dri's email instead of dri's role!/
              email=dri
              event_name= delayed_event["title"]
              dri_role=dri

              event_id=eventId
              team_id=flash_team_json["id"]
              #TODO change to current host
              default_url_options[:host] = 'localhost:3000'
              url = url_for :controller => 'flash_teams',:action => 'delay',:id =>team_id.to_s, :event_id => event_id.to_s
              #url="http://localhost:3000/flash_teams/"+team_id.to_s+"/"+(event_id-1).to_s+"/delay"
              #UserMailer.send_dri_on_delay_email(email,event_name, dri_role,url,team_id,event_id).deliver
              break
            end
          end
        end

        #DRI has not responded yet, send email to all members
        if delta_time_sec >= (2 * call_period)
          print "******"
          print notification_email_status
          print groupNum
          if notification_email_status[groupNum]== nil
            flash_team_events.each do |event|
            eventId = event["id"];
            if eventId == groupNum
              
               delayed_event=event
               /TODO considered the first member is the dri for now. Change this when dri feature is added/
                if delayed_event["members"].length == 0
                  print "error: delayed event has no members\n"
                break
                end
                event_name= delayed_event["title"]
                dri =  delayed_event["members"][0]
                dri_role=dri
                event_id=eventId
                team_id=flash_team_json["id"]

                #TODO send email to all members
                dri =  delayed_event["members"][0]
                /TODO get dri's email instead of dri's role!/
                email=dri
                
            

               # UserMailer.send_delayed_dri_not_responded(email,event_name,dri_role).deliver;   
                break
              end
            end
          end
        end
      end
    end
  end
end


/TODO consider the first member is the dri for now/
/TODO replace role with email/

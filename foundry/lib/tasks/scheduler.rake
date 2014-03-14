require 'json'
require 'socket'

namespace :notification do
  desc "Send notification emails when a task is delayed."
  task email_delayed_task: :environment do
   
   include ActionDispatch::Routing::UrlFor
   #include ActionController::UrlFor  #requires a request object
   include Rails.application.routes.url_helpers

   #change default_url_option to current host
   default_url_options[:host] = 'flashteams.herokuapp.com'
   #script should be scheduled to run every call_period seconds
   call_period= 5 * 60 #seconds
   puts "checking if a task is delayed..."

   
    cur_time= (Time.now.to_f * 1000).to_i
         
    #print Member.where(:name => "negar 1")[0]
    members = Member.all
    
    flash_teams = FlashTeam.all
   	flash_teams.each do |flash_team|
      next if flash_team.status == nil


      flash_team_status = JSON.parse(flash_team.status)
           	
      flash_team_json=flash_team_status["flash_teams_json"]
      flash_team_members=flash_team_json["members"]
      
      #when end button is pushed members is emptied

      if flash_team_members.length == 0
          flash_team.notification_email_status = JSON.dump([])
          flash_team.save
      end
      next if flash_team_members.length == 0
      
      delayed_tasks_time=flash_team_status["delayed_tasks_time"]
      
      #dri_responded=flash_team_status["dri_responded"]
      if flash_team.notification_email_status != nil
        notification_email_status = JSON.parse(flash_team.notification_email_status)
      else
        notification_email_status=[]
      end
      flash_team_events=flash_team_json["events"]
   
     

      delayed_tasks_num=flash_team_status["delayed_tasks"]
      remaining_tasks = flash_team_status["remaining_tasks"]
      live_tasks = flash_team_status["live_tasks"]
      #get members of live and remaining tasks
      #TODO get actual emails
      roles_remaining_live=[];
      remaining_tasks.each do |remaining_task|
         groupNum = remaining_task;
         flash_team_events.each do |event|
          eventId = event["id"];
          if eventId == groupNum
            event["members"].each do |member|
              if event["members"].length == 0
                print "error: delayed event has no members\n"
                break
              end    
              if roles_remaining_live.index(member)==nil
                roles_remaining_live.push(member);
              end
            end
          end
        end
      end
      live_tasks.each do |remaining_task|
         groupNum = remaining_task;
         flash_team_events.each do |event|
          eventId = event["id"];
          if eventId == groupNum
            event["members"].each do |member|
              if event["members"].length == 0
                print "error: delayed event has no members\n"
                break
              end    
              if roles_remaining_live.index(member)==nil
                roles_remaining_live.push(member);

              end
            end
          end
        end
      end

      #end
      print "Checking flash team number: "
      print flash_team_json["id"]
      puts "\n"
      
      /get index of delayed event in events array/
      
      delayed_tasks_num.each do |groupNum|
        
        start_time= delayed_tasks_time[groupNum]
        delta_time_sec= (cur_time - start_time)/1000

        print "elapsed time: "
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
              event_name= delayed_event["title"]
              dri_role=dri

              event_id=eventId
              team_id=flash_team_json["id"]
              
              url = url_for :controller => 'flash_teams',:action => 'delay',:id =>team_id.to_s, :event_id => event_id.to_s
              
              #member_id= delayed_event["dri"]
              tmp_member= flash_team_members.detect{|m| m["role"] == dri_role}
              member_id= tmp_member["id"]
              #dri_role= delayed_event["members"][member_id]
              if Member.where(:id => member_id).blank?
                print "member "+tmp_member["role"]+" was not saved in Members"
              else
                  email_dri = Member.find(member_id).email
                 UserMailer.send_dri_on_delay_email(email_dri,event_name, dri_role,url,team_id,event_id).deliver
              end

             
              break
            end
          end
        end
          print "******\n"
          print notification_email_status
          print groupNum
        #DRI has not responded yet, send email to remaining members
        if delta_time_sec >= (2 * call_period) && delta_time_sec < (3 * call_period)
          print "******\n"
          print notification_email_status
          print groupNum
          if notification_email_status[groupNum-1]== nil
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

                #TODO CC members
                dri =  delayed_event["members"][0]

                /TODO get  email instead of role!/
                roles_remaining_live.each do |role|
                    tmp_member= flash_team_members.detect{|m| m["role"] == role}
                    member_id= tmp_member["id"]
                    #Member.find(member_id).email
                    if Member.where(:id => member_id).blank?
                      print "member "+tmp_member["role"]+" was not saved in Members"
                    else
                      UserMailer.send_delayed_dri_not_responded(Member.find(member_id).email,event_name,dri_role).deliver;   
                    end
                end
                break
              end
            end
          end
        end
      end
    end
  end
end


/TODO considered the first member is the dri/

require 'json'

namespace :notification do
  desc "Send notification emails when a task is delayed."
  task email_delayed_task: :environment do
    puts "checking if a task is delayed..."
   

    flash_teams = FlashTeam.all
   	flash_teams.each do |flash_team|

      flash_team_status = JSON.parse(flash_team.status)
       	flash_team_json=flash_team_status["flash_teams_json"]
        flash_team_members=flash_team_json["members"]

        flash_team_events=flash_team_json["events"]
        delayed_tasks_num=flash_team_status["delayed_tasks"]
        print "Checking flash team number: "
        print flash_team_json["id"]
        puts "\n"
        
        /get index of delayed event in events array/
        
        delayed_tasks_num.each do |groupNum|

          flash_team_events.each do |event|
            eventId = event["id"];
              if eventId == groupNum
                   /send email to dri/
                   delayed_event=event
                   /TODO consider the first member is the dri for now/
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
                   UserMailer.send_dri_on_delay_email(email,event_name, dri_role).deliver
                  break
              end
          end

         
        

          /set flag that the email is sent/

        end
       
       	/cur_time= (Time.now.to_f * 1000).to_i
       	start_time= flash_team_json["startTime"]
        print cur_time - start_time/

        
      
     end
  end
end

/TODO consider the first member is the dri for now/
/TODO replace role with email/
/TODO what if  the flash team is not running yet -> error!/
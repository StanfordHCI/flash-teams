require 'json'

namespace :notification do
  desc "Send notification emails when a task is delayed."
  task email_delayed_task: :environment do
    puts "checking if a task is delayed..."
   
    #script should be scheduled to run every call_period seconds
    call_period= 1 * 60
    cur_time= (Time.now.to_f * 1000).to_i
         
    flash_teams = FlashTeam.all
   	flash_teams.each do |flash_team|

        flash_team_status = JSON.parse(flash_team.status)
             	
        flash_team_json=flash_team_status["flash_teams_json"]
        flash_team_members=flash_team_json["members"]
        delayed_tasks_time=flash_team_status["delayed_tasks_time"]
        dri_responded=flash_team_status["dri_responded"]
        print "*****"
        print dri_responded
        puts '\n'
        #print flash_team_json

        #if flash_team_json.include? "sent_dri_list"
        #    flash_team_json["sent_dri_list"]= [0]
        #    flash_team_json["sent_delay_all"]= [0]
        #    puts "*******"
        #end
        #  print flash_team_json
        #sent_dri_list=flash_team_json["sent_dri_list"]
        #print sent_dri_list
        #sent_delay_all=flash_team_json["sent_delay_all"]
        #flash_team_json["test"]="ngar"
        #flash_team_status["flash_teams_json"]=flash_team_json
        #flash_team.status=JSON.dump(flash_team_status)
        #flash_team.save

        flash_team_events=flash_team_json["events"]
        delayed_tasks_num=flash_team_status["delayed_tasks"]
        print "Checking flash team number: "
        print flash_team_json["id"]
        puts "\n"
        
        /get index of delayed event in events array/
        
        delayed_tasks_num.each do |groupNum|
          #check if already an email is sent to dri for this event
          already_sent_dri=0
          
          #if sent_dri_list.count!=0
           # for e_id in sent_dri_list
           #   if e_id==groupNum
             #   already_sent=1
            #  end
            #end
          #end
          print  delayed_tasks_time
          puts '\n'
          print delayed_tasks_num
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
                      #url = url_for :controller => '/flash_teams', :team_id => team_id, :event_id => event_id, :action => 'get_delay'
                      #url="tst!!"
                      #puts "sent email"
                      url="http://localhost:3000/flash_teams/"+team_id.to_s+"/"+(event_id-1).to_s+"/delay"
                      UserMailer.send_dri_on_delay_email(email,event_name, dri_role,url,team_id,event_id).deliver
                      
                       #save sent_dri_list
                      #sent_dri_list.push(event_id)
                      #sent_delay_all.push(0)

                      #flash_team_json["sent_dri_list"]= sent_dri_list
                      #flash_team_json["sent_delay_all"]= sent_delay_all
                      #flash_team_status["flash_teams_json"]=flash_team_json
                      #flash_team.status=JSON.dump(flash_team_status)
                      #flash_team.save

                    break
                end
            end

             if delta_time_sec>=2 * call_period


             end

           
          end    
         
        

         

        end
       
     end
  end
end

/TODO set flag that the email is sent/
/TODO what if  the flash team is not running yet -> error!/

/TODO consider the first member is the dri for now/
/TODO replace role with email/

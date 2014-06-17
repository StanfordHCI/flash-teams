function notifyMe(notif_title, notif_body) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }
  
  // Let's check if the user is okay to get some notification
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(notif_title, {body: notif_body })
    /*
		notification.onshow = function() { 
    		console.log("ONSHOW");
			setTimeout(notification.close(), 5000);
     }
*/
    playSound("/assets/notify");
    
    
    
  }

  // Otherwise, we need to ask the user for permission
  // Note, Chrome does not implement the permission static property
  // So we have to check for NOT 'denied' instead of 'default'
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {

      // Whatever the user answers, we make sure we store the information
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }

      // If the user is okay, let's create a notification
      if (permission === "granted") {
		 var notification = new Notification(notif_title, { body: notif_body })
        
        playSound("/assets/notify");
        
       //notification.onshow = function() { setTimeout(notification.close, 2000) }
              
      }
    });
   
	


  }

  // At last, if the user already denied any notification, and you 
  // want to be respectful there is no need to bother him any more.
}


//filename without extension (can be a path like "assets/notify")
function playSound(filename){   
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="' + 
    filename + '.mp3" type="audio/mpeg" /><source src="' + filename 
    + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' 
    + filename +'.mp3" /></audio>';
}
     
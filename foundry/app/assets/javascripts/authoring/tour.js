/* tour.js
 * ---------------------------------------------
 * 
 * 
 */

//A tour that walks a user through the team authoring process
var authoringTour = new Tour({
	steps: [
	{
		orphan: true, 
		title: "<b>Welcome to Foundry</b>", 
		content: "Add members to your team,"
		+ " draw events on the timeline and assign members to them,"
		+ " guide their communication and collaboration efforts,"
		+ " and run your team and monitor their progress",
		backdrop: true
	}, 
	{
		element: "#member-container",
		title: "<b>Team Roles</b>",
		content: "In this panel, you can add role-based members to the team"
	},
	{
		element: "#member-container",
		title: "<b>Customize Each Role</b>",
		content: "You can add categories to each roles as well as necessary "
		+"skills based on the oDesk platform."
	},
	{
		element: "#member-container",
		title: "<b>Invite the Members</b>",
		content: "When you have recruited members to your team, use the invite "
		+"link at the bottom of the popover to send an invitation link to the workers, "
		+" so they can log in to Foundry and track their progress."
	},
	{
		orphan: true,
		title: "<b>Interactive Task-Based Timeline</b>",
		content: "This is the timeline. You can click to add an event."
	},
	{
		orphan: true,
		title: "<b>Customize the Events</b>",
		content: "Use the pop-up form to change the details of the events"
	},
	{
		orphan: true,
		title: "<b>Customize the Events</b>",
		content: "Change the start time and duration, add members to the event " 
		+"assign a directly-responsible individual, add notes for the workers "
		+"and add inputs and outputs to each event to guide the work."
	},
	{
		orphan: true,
		title: "<b>Calendar Interface Interactions</b>",
		content: "Drag the event to change the start time and " 
		+"drag the handles to change the duration of the event"
	},
	{
		orphan: true,
		title: "<b>Handoffs</b>",
		content: "Click on the gray arrow button on an event to " 
		+"start drawing a handoff, click another event to complete the interaction."
	},
	{
		orphan: true,
		title: "<b>Collaborations</b>",
		content: "Click on the black double-sided arrow button on an event to " 
		+"start drawing a collaboration between two overlapping events, "
		+" click another event to complete the interaction."
	},
	{
		orphan: true,
		title: "<b>Google Drive Integration</b>",
		content: "When events are drawn, Google Drive folders are automatically " 
		+"created for each event, workers can upload their work to the folders "
		+"by clicking 'Upload' on the event."
	},
	{
		orphan: true,
		title: "<b>Open in Drive</b>",
		content: "After clicking on 'Upload' on the event, click on the "
		+"'Open in Drive' button on the top right side of the Google " 
		+"drive page so that you can upload to the drive."
	},
	{
		element: "#search-events-container" ,
		title: "<b>Event Library</b>", 
		content: "This is the event library. Here you can search over " 
		+"all previously created events by entering in keywords, inputs, "
		+"and outputs, and drag them to your timeline."
	},
	{
		element: "#flashTeamStartBtn",
		title: "<b>Start the Team</b>",
		content: "When you are done creating your workflow and hiring team members "
		+"click here to begin the team! ",
		placement: "bottom"
	},
	{
		element: "#chat-box-container" ,
		title: "<b>Chat With the Team</b>", 
		content: "Once the team has started working, you can chat with " 
		+"all of the team members in this group chat box."
	}
]});

//Initialize the tour
authoringTour.init();

$("#tourBtn").click(function(){
    authoringTour.start(true);
    authoringTour.goTo(0); //Always start tour at the first step
});


//A tour to walk the team members / experts through the use of Foundry
var expertTour = new Tour({
	steps: [
	{
		orphan: true, 
		title: "<b>Welcome to Foundry</b>", 
		content: "Here you can view your upcoming tasks,"
		+ "see where you should communicate with other members of the team "
		+ "track the progress of the project, "
		+ "and upload and download files from a shared Google Drive folder.",
		backdrop: true
	},
	{
		element: "#project-status-container",
		title: "<b>Project Status</b>", 
		content: "This panel contains information about this project."
	},
	{
		element: "#gFolder" ,
		title: "<b>Google Drive Project Folder</b>", 
		content: "At the top is a link to the Google Drive folder " 
		+"for the entire project."
	},
	{
		element: "#project-status-container" ,
		title: "<b>Upcoming Tasks</b>", 
		content: "You can also see the status of the entire project " 
		+"as well as your next upcoming task."
	},
	{
		element: "#chat-box-container" ,
		title: "<b>Chat With the Team</b>", 
		content: "You can use this chat feature to commmunicate with the " 
		+"members of the team as well as the project requester."
	},
	{
		element: "#timeline-container" ,
		title: "<b>Timeline</b>", 
		content: "This is the timeline. Here you can view the entire project's " 
		+"workflow. And its current status.",
		placement: "left"
	},
	{
		element: ".cursor" ,
		title: "<b>Time Ticker</b>", 
		content: "You can see the stage of the project as indicated by " 
		+"the red time ticker."
	},
	{
		orphan: true,
		title: "<b>Complete Your Events</b>", 
		content: "If you are the DRI, when you have completed the work for your event, uploaded " 
		+"any relevant files, etc. you can click the event and choose 'Complete' to mark "
		+"the task as done and auto notifiy the next workers that they can begin working."
	},
	{
		orphan: true,
		title: "<b>Open in Drive</b>",
		content: "After clicking on 'Upload' on the event, click on the "
		+"'Open in Drive' button on the top right side of the Google " 
		+"drive page so that you can upload to the drive."
	},
	{
		orphan: true,
		title: "<b>Delayed Events</b>", 
		content: "If your work takes longer than the expected estimation, the event "
		+"will extend in red and be marked as delayed. Foundry will email you to request "
		+"a new estimated complete time so the downstream workers can be notified." 
	},
	{
		orphan: true,
		title: "<b>Early Events</b>", 
		content: "Similarly, if you complete earlier than the expected estimation, the "
		+"event will be marked in blue, downstream tasks will shift up, and "
		+"downstream workers will be notified that they can/should start early." 
	},
	{
		orphan: true,
		title: "<b>Good luck! </b>", 
		content: "Good luck with your project and please enjoy the use of Foundry!"
	}
]});


//Initialize the expert tour
expertTour.init();

$("#expertTourBtn").click(function(){
    expertTour.start(true);
    expertTour.goTo(0); //Always start the tour at the first step 
});


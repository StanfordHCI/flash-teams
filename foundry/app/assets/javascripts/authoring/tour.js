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
		title: "<b>Cuztomize the Events</b>",
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
		content: "Click on the black arrow button on an event to " 
		+"start drawing a handoff, click another event to complete the interaction."
	},
	{
		orphan: true,
		title: "<b>Collaborations</b>",
		content: "Click on the gray double-sided arrow button on an event to " 
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
		element: "#flashTeamStartBtn",
		title: "<b>Start the Team</b>",
		content: "When you are done creating your workflow and hiring team members "
		+"click here to begin the team! ",
		placement: "bottom"
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
	}
]});


//Initialize the expert tour
expertTour.init();

$("#expertTourBtn").click(function(){
    expertTour.start(true);
    //expertTour.goTo(0); //Always start the tour at the first step 
});


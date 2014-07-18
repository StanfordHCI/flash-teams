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
		title: "Welcome to Foundry", 
		content: "Add members to your team,"
		+ " draw events on the timeline and assign members to them,"
		+ " guide their communication and collaboration efforts,"
		+ " and run your team and monitor their progress"
	}, 
	{
		element: "#member-container",
		title: "Team Roles",
		content: "In this panel, you can add role-based members to the team"
	},
	{
		element: "#member-container",
		title: "Customize Each Role",
		content: "You can add categories to each roles as well as necessary "
		+"skills based on the oDesk platform."
	},
	{
		element: "#member-container",
		title: "Invite the Members",
		content: "When you have recruited members to your team, use the invite "
		+"link at the bottom of the popover to send an invitation link to the workers, "
		+" so they can log in to Foundry and track their progress."
	},
	{
		orphan: true,
		title: "Interactive Task-Based Timeline",
		content: "This is the timeline. You can click to add an event."
	},
	{
		orphan: true,
		title: "Customize the Events",
		content: "Use the pop-up form to change the details of the events"
	},
	{
		orphan: true,
		title: "Cuztomize the Events",
		content: "Change the start time and duration, add members to the event " 
		+"assign a directly-responsible individual, add notes for the workers "
		+"and add inputs and outputs to each event to guide the work."
	},
	{
		orphan: true,
		title: "Calendar Interface Interactions",
		content: "Drag the event to change the start time and " 
		+"drag the handles to change the duration of the event"
	},
	{
		orphan: true,
		title: "Handoffs",
		content: "Click on the black arrow button on an event to " 
		+"start drawing a handoff, click another event to complete the interaction."
	},
	{
		orphan: true,
		title: "Collaborations",
		content: "Click on the gray double-sided arrow button on an event to " 
		+"start drawing a collaboration between two overlapping events, "
		+" click another event to complete the interaction."
	},
	{
		orphan: true,
		title: "Google Drive Integration",
		content: "When events are drawn, Google Drive folders are automatically " 
		+"created for each event, workers can upload their work to the folders "
		+"by clicking 'Upload' on the event."
	},
	{
		element: "#flashTeamStartBtn",
		title: "Start the Team",
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

]});

//Initialize the expert tour
expertTour.init();

$("#expertTourBtn").click(function(){
    console.log("Expert tour button fired");
    expertTour.start(true);
    expertTour.goTo(0); //Always start the tour at the first step 
});


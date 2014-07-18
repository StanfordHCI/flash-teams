/* tour.js
 * ---------------------------------------------
 * 
 * 
 */

//A tour that walks a user through the team authoring process
var authoringTour = new Tour({
	steps: [
	{
		element: "#ft-name", 
		title: "Flash Teams Name Tour", 
		content: "Hello world"
	}
]});

authoringTour.init();

authoringTour.start();
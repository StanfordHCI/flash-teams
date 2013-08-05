/*
 *
 *
 */


function addMember() {
	console.log("You clicked the Add button.");
}

var availableMembers = [
	"3D Modeling & CAD",
	"Accounting",
	"Advertising",
	"Animation",
	"Application Interface Design",
	"Audio Production",
	"Blog & Article Writing",
	"Bookkeeping",
	"Business Consulting",
	"Business Plans & Marketing Strategy",
	"Copywriting",
	"Creative Writing",
	"Customer Service & Support",
	"Data Entry",
	"DBA - Database Administration",
	"Desktop Applications",
	"Ecommerce",
	"Email Marketing",
	"Email Response Handling",
	"Engineering & Technical Design",
	"ERP/CRM Implementation",
	"Financial Services & Planning",
	"Game Development",
	"Graphic Design",
	"HR/Payroll",
	"Illustration",
	"Legal",
	"Logo Design",
	"Market Research & Surveys",
	"Mobile Apps",
	"Network Administration",
	"Order Processing",
	"Other - Administrative Support",
	"Other - Business Services",
	"Other - Customer Service",
	"Other - Design & Multimedia",
	"Other - Networking & Information Systems",
	"Other - Sales & Marketing",
	"Other - Software Development",
	"Other - Web Development",
	"Other - Writing & Translation",
	"Payment Processing",
	"Personal Assistant",
	"Phone Support",
	"Presentations",
	"Print Design",
	"Project Management",
	"PR - Public Relations",
	"Recruiting",
	"Sales & Lead Generation",
	"Scripts & Utilities",
	"SEM - Search Engine Marketing",
	"SEO - Search Engine Optimization",
	"Server Administration",
	"SMM - Social Media Marketing",
	"Software Plug-ins",
	"Software Project Management",
	"Software QA",
	"Statistical Analysis",
	"Technical Support",
	"Technical Writing",
	"Telemarketing & Telesales",
	"Transcription",
	"Translation",
	"Video Production",
	"Voice Talent",
	"VOIP",
	"Web Design",
	"Web Programming", 
	"Web Research",
	"Website Content",
	"Website Project Management",
	"Website QA",
	"UI Design",
	"UX Research"
];

$(document).ready(function() {
	$("#addMemberInput").autocomplete({

		source: availableMembers
	});
});




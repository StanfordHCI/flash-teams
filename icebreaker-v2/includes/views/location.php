<!DOCTYPE html>
<html>
	<head>
	<title>IceBreaker</title>

	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.1/jquery.mobile-1.3.1.min.css" />
        <link rel="stylesheet" href="assets/css/styles.css" />

        <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.3.1/jquery.mobile-1.3.1.min.js"></script>
        <script src="http://maps.google.com/maps/api/js?sensor=false"></script>
	<script>
	/*
	 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
	 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
	 */

	function setLocation() {
                var defaultLatLng = new google.maps.LatLng(34.0983425, -118.3267434);  // Default to Hollywood, CA when no geolocation support

		if ( navigator.geolocation ) {
			function success(pos) {
				// Location found, show map with these coordinates
		                drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			}

			function fail(error) {
				drawMap(defaultLatLng);  // Failed to find location, show default map
			}

			// Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
			navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
		} else {
			drawMap(defaultLatLng);  // No geolocation support, show default map
		}

		function drawMap(latlng) {
			var myOptions = {
				zoom: 10,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

			// Add an overlay to the map of current lat/lng
			var marker = new google.maps.Marker({
				position: latlng,
				map: map,
				title: "Greetings!"
			});
		}

	};
	</script>
</head>
<body>

<div data-role="page" >

	<div data-role="header" data-theme="b">
            <a href="#" data-rel="back">back</a>
	    <a href="./" data-icon="home" data-iconpos="notext" data-transition="fade">Home</a>
		<h1>Set Location</h1>

	</div>
        
	<div data-role="content" id="map-canvas" style="min-height:300px;">
            <a href="#" onclick="setLocation()">Set Location</a>
         
<?php render('_footer')?>

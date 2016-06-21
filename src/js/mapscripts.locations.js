/**
 * Locations innehåller allt som har med att hämta kartinfo från Google Maps geocode-API att göra
 */

function addLocation(latlng) {
	geocoder.geocode({'location': latlng}, geocb);

	function geocb(results, status) {

		if(status !== google.maps.GeocoderStatus.OK) {
			console.error(status);
			return false;
		}

		if(results[2]) {
			var address = results[2].formatted_address;
			var marker_id = addStaticMarker(latlng, address);
			addToPlacesList(address, marker_id);
			addMarkerToDB(marker_id, latlng, address);
		} 
		else {
	        alert('Ingen address hittad!');
		}
	}
}

function updateLocation(infowindow, latlng, marker_id) {
	geocoder.geocode({'location': latlng}, geocb);
	var marker;
	for(i in markers) {
		if(Number(marker_id) === Number(i)) {
			marker = markers[i];
		}
	}

	function geocb(results, status) {

		if(status !== google.maps.GeocoderStatus.OK) {
			console.error(status);
			return false;
		}

		if(results[2]) {
			var address = results[2].formatted_address;
			$('#'+marker_id+'_address').text(address);
			updatePlaceList(marker_id, address);
			updateMarkerInDB(marker_id, latlng, address);
		} 
		else {
	        alert('Ingen address hittad!');
		}
	}
}

function removeLocationAndMarker(marker_id) {
	
	$('.place[data-content="'+marker_id+'"]').fadeOut(200, function() {
		$(this).remove();
	});
	markers[marker_id].setMap(null);
	delete markers[marker_id];
	console.log(markers);
	updatePath(markers);
	updateMarkerTitles(markers);
}
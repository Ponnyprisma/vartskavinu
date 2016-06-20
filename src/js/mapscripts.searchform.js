/**
 * Här ligger allt som har att göra med sökformuläret
 */

function findByForm(address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
		if (status !== google.maps.GeocoderStatus.OK) {
			console.error(status);
			return false;
		}
		
		var latlng = results[0].geometry.location;
		map.setCenter(latlng);
		setMovableMarker(latlng);
      
    });
}
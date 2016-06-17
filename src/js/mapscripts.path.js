/**
 * Här ligger allt som har att göra med vår sträckning av reserutten
 */

function addToPath(latlng) {

	if(round_trip) {
		path_coordinates.pop();
	}

	path_coordinates.push({'lat': latlng.lat(), 'lng': latlng.lng()});

	if(round_trip) {
		path_coordinates.push({'lat': markers[0].getPosition().lat(), 'lng': markers[0].getPosition().lng()})
	}
	
	if(path) path.setMap(null);

	createPath(path_coordinates);

}

function updatePath(markers) {

	path_coordinates = [];
	bounds = new google.maps.LatLngBounds();
	for(i in markers) {
		latlng = new google.maps.LatLng(markers[i].getPosition().lat(), markers[i].getPosition().lng());
		path_coordinates.push(latlng);
		bounds.extend(latlng);
	}

	if(round_trip) {
		path_coordinates.push({'lat': markers[0].getPosition().lat(), 'lng': markers[0].getPosition().lng()})
	}

	if(path) path.setMap(null);

	createPath(path_coordinates);

}

function createPath(path_coordinates) {
	path = new google.maps.Polyline({
		path: path_coordinates,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: .5,
		strokeWeight: 2
	});

	path.setMap(map);
}
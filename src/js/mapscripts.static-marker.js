/**
 * Här ligger allt som har att göra med de utplacerade statiska markörerna
 */

function addStaticMarker(latlng, infoWindowContent) {

	// Skapa ett nytt markörobjekt
	var marker = new google.maps.Marker({
		position: latlng, // var på kartan markören ska befinna sig
		map: map, // vilket kartobjekt som markören ska vara på
		icon: standardMarker, // vi anger vilken markör som ska visas
		animation: google.maps.Animation.DROP,
		draggable: true
	});

	markers.push(marker);
	var marker_id = (markers.length-1);
	if(marker_id === 0) {
		getRoundTripFromDB();
	}

	updateMarkerTitles(markers);

	// Funktion för att lägga till ett infofönster när man klickar på en markör
	var infowindow = addInfoWindow(marker, createStaticMarkerContent(marker, marker_id, infoWindowContent));
	addToPath(latlng);
	bounds.extend(latlng);
	if(markers.length > 1) {
		map.fitBounds(bounds);
	}

	marker.addListener('dragend',function(e) {
        updatePath(markers);
        updateLocation(infowindow, e.latLng, marker_id);
    });

    marker.addListener('drag',function(e) {
        path.setOptions({strokeOpacity: .2});
    });

    return marker_id;

}

/*
	Funktionen med vilken man skapar ett infofönster som man få fram när man klickar på en markör
 */
function addInfoWindow(marker, infoWindowContent) {

	// Skapa ett nytt infoWindow-objekt
	var infowindow = new google.maps.InfoWindow({
		content: infoWindowContent // Det innehåll vi skickar in i funktionen som "infoWindowContent" blir dess innehåll
	});
	// Sätt en eventlyssnare på markören så den vet att den ska visa sin infowindow på klick
	marker.addListener('click', function() {
		infowindow.open(marker.get('map'), marker);
	});

	return infowindow;
}

function createStaticMarkerContent(marker, marker_id, address) {
	var output = '';

	output += '<div class="static-marker-content">';
	output += '<h4 id="'+marker_id+'_address">'+address+'</h4>';
	output += '<form class="form">';

	if(marker === markers[0]) {
		output += '<div class="form-group">';
		output += '<input type="text" name="departure_date" data-target="'+marker_id+'" class="form-control datepicker minDate startdate">';
		output += '</div>';
		output += '<div class="form-group">';
		output += '<label><input type="checkbox" id="round-trip" value="1" ';
		if(round_trip) {
			output += ' checked="checked"';
		}
		output +='> Rundresa</label>'; 
		output += '</div>';
		output += '<div class="form-group">';
		output += '<input type="text" name="arrival_date" data-target="'+marker_id+'" class="form-control datepicker maxDate enddate" id="roundtrip_arrival_date">';
		output += '</div>';	
	}

	if(marker !== markers[0]) {
		output += '<div class="form-group">';
		output += '<input type="text" name="arrival_date" data-target="'+marker_id+'" class="form-control datepicker minDate">';
		output += '<input type="text" name="departure_date" data-target="'+marker_id+'" class="form-control datepicker minDate">';
		output += '<a href="#" class="delete-marker" data-target="'+marker_id+'">Radera markör</a>';
		output += '</div>';
	}

	output += '</form>';
	output += '</div>';

	return output;
}

function setRoundTrip() {

	var latlng = markers[0].getPosition();
	addToPath(latlng);
	round_trip = true;
	$('input#roundtrip_arrival_date').slideDown(500, function() {
		$(this).addClass('visible');	
	});
	$('#places-list-end').slideDown(500, function() {
		$(this).addClass('visible');	
	});

}

function setOneWayTrip() {

	round_trip = false;
	updatePath(markers);
	$('input#roundtrip_arrival_date').slideUp(200, function() {
		$(this).removeClass('visible');	
	});
	$('#places-list-end').slideUp(200, function() {
		$(this).removeClass('visible');	
	});

}

function updateMarkerTitles(markers) {
	var no = 0;

	for(var i in markers) {
		var title = no === 0 ? 'Resan startar här' : 'Resmål nummer '+no;
		markers[i].setTitle(title);
		no += 1;
	}
}

function addMarkerToDB(marker_id, latlng, address) {

	markerData = {
		'marker_id': marker_id,
		'lat': latlng.lat(),
		'lng': latlng.lng(),
		'address': address
	}

	$.ajax({
		type: "POST",
		data: markerData,
		url: '/map/addmarker/',
		success: function(e){
			console.log(e);
		}	
	});

}

function deleteMarkerFromDB(marker_id) {

	markerData = {
		'marker_id': marker_id
	}

	$.ajax({
		type: "POST",
		data: markerData,
		url: '/map/deletemarker/',
		success: function(e){
			console.log(e);
		}	
	});

}

function updateMarkerInDB(marker_id, latlng, address) {

	markerData = {
		'marker_id': marker_id,
		'lat': latlng.lat(),
		'lng': latlng.lng(),
		'address': address
	}

	$.ajax({
		type: "POST",
		data: markerData,
		url: '/map/updatemarker/',
		success: function(e){
			console.log(e);
		}	
	});

}

function getAllMarkersFromDB() {
	$.ajax({
		type: "POST",
		url: '/map/getallmarkers/',
		dataType: 'json',
		success: function(markers_from_db){
			for(var i in markers_from_db) {
				latlng = new google.maps.LatLng(markers_from_db[i].lat, markers_from_db[i].lng);
				addLocation(latlng);
			}
			console.log(markers_from_db);
		}	
	});
}

function changeRoundTripInDB() {
	$.ajax({
		type: "POST",
		url: '/map/changeroundtrip/',
		success: function(e){
			console.log(e);
		}	
	});
}

function getRoundTripFromDB() {
	$.ajax({
		type: "POST",
		url: '/map/getroundtrip/',
		dataType: 'json',
		success: function(e){
			if(e.round_trip === '1') {
				setRoundTrip();
			}
			else {
				setOneWayTrip();
			}
		}	
	});
}





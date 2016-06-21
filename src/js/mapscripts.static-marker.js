/**
 * Här ligger allt som har att göra med de utplacerade statiska markörerna
 */

function addStaticMarker(latlng, infoWindowContent, marker_id, arrival_date, departure_date) {

	arrival_date = typeof arrival_date !== 'undefined' ? arrival_date : '';
	departure_date = typeof departure_date !== 'undefined' ? departure_date : '';

	// Skapa ett nytt markörobjekt
	var marker = new google.maps.Marker({
		position: latlng, // var på kartan markören ska befinna sig
		map: map, // vilket kartobjekt som markören ska vara på
		icon: standardMarker, // vi anger vilken markör som ska visas
		animation: google.maps.Animation.DROP,
		draggable: true
	});

	marker_id = typeof marker_id !== 'undefined' ? marker_id : (markers.length);
	markers[marker_id] = marker;

	updateMarkerTitles(markers);

	// Funktion för att lägga till ett infofönster när man klickar på en markör
	var infowindow = addInfoWindow(marker, createStaticMarkerContent(marker, marker_id, infoWindowContent, arrival_date, departure_date));
	addToPath(latlng, marker_id);
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
function addInfoWindow(marker, infoWindowContent, arrival_date, departure_date) {

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

function createStaticMarkerContent(marker, marker_id, address, arrival_date, departure_date) {

	var output = '';

	output += '<div class="static-marker-content">';
	output += '<h4 id="'+marker_id+'_address" class="text-light">'+address+'</h4>';
	output += '<form class="form">';

	if(marker_id === 0) {
		output += '<div class="form-group">';
		output += '<label class="text-light"><i class="fa fa-plane fa-fw text-light"></i> Departure</label>';
		output += '</div>';
		output += '<div class="form-group">';
		output += '<input type="text" name="departure_date" data-target="'+marker_id+'" class="form-control datepicker minDate startdate margin-md-bottom" value="'+departure_date+'">';
		output += '</div>';
		output += '<div class="form-group">';
		output += '<label class="text-light"><input type="checkbox" id="round-trip" value="1" ';
		if(round_trip) {
			output += ' checked="checked"';
		}
		output +='> Rundresa</label>'; 
		output += '</div>';
		output += '<div class="form-group';
		if(round_trip) {
			output += ' visible';
		}
		output += '" id="arrival-wrap">';
		output += '<label class="text-light"><i class="fa fa-plane fa-fw fa-rotate-90 text-light"></i> Arrival</label>';
		output += '<input type="text" name="arrival_date" data-target="'+marker_id+'" class="form-control datepicker maxDate enddate margin-md-bottom';
		if(round_trip) {
			//output += ' visible';
		}
		output += '" id="roundtrip_arrival_date" value="'+arrival_date+'">';
		output += '</div>';	
	}

	if(marker_id !== 0) {
		output += '<div class="form-group">';
		output += '<label class="text-light"><i class="fa fa-plane fa-fw fa-rotate-90 text-light"></i> Arrival</label>';
		output += '<input type="text" name="arrival_date" data-target="'+marker_id+'" class="form-control datepicker minDate margin-md-bottom" value="'+arrival_date+'">';
		output += '<label class="text-light"><i class="fa fa-plane fa-fw text-light"></i> Departure</label>';
		output += '<input type="text" name="departure_date" data-target="'+marker_id+'" class="form-control datepicker minDate margin-md-bottom" value="'+departure_date+'">';
		output += '<a href="#" class="delete-marker text-light pull-right padding-sm-bottom" data-target="'+marker_id+'"><i class="fa fa-trash fa-2x" aria-hidden="true"></i></a>';
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
	$('#arrival-wrap').slideDown(500, function() {
		$(this).addClass('visible');	
	});
	$('#places-list-end').slideDown(500, function() {
		$(this).addClass('visible');	
	});
	console.log('round trip set');
}

function setOneWayTrip() {

	round_trip = false;
	updatePath(markers);
	$('#arrival-wrap').slideUp(200, function() {
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
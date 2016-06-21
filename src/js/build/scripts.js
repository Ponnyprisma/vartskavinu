var newMaxDate = null;
var newMinDate = new Date();

$(document).ready(function() {
	/*
		När man klickar på ett element med data-toggle "offcanvas" ges .row-canvas en extra klass, "active" som gör att den slajdar in på mobil
	 */
	$('[data-toggle="offcanvas"]').click(function () {
		$('.row-offcanvas').toggleClass('active')
	});

	$('body').on('focus',".datepicker:not(.startdate)", function(){
		$(this).datepicker({
			minDate: newMinDate,
			maxDate: newMaxDate,
			dateFormat: "yy-mm-dd",
			onClose: function( selectedDate ) {
				var this_marker_id = $(this).attr('data-target');
				var this_marker_name = $(this).attr('name');
				addDateToList(this_marker_id, this_marker_name, selectedDate);
				setDateInDB(this_marker_id, this_marker_name, selectedDate);
      			if ($(this).hasClass('minDate')) {
					newMinDate = selectedDate;
      			}
      			else if ($(this).hasClass('maxDate')) {
					newMaxDate = selectedDate;
					$('.datepicker.minDate').datepicker('option', 'maxDate', newMaxDate);
      			}
      		}
		});
	});

	$('body').on('focus',".datepicker.startdate", function(){
		$(this).datepicker({
			minDate: new Date(),
			maxDate: newMaxDate,
			dateFormat: "yy-mm-dd",
			onClose: function( selectedDate ) {
				var this_marker_id = $(this).attr('data-target');
				var this_marker_name = $(this).attr('name');
				addDateToList(this_marker_id, this_marker_name, selectedDate);
				setDateInDB(this_marker_id, this_marker_name, selectedDate);
				newMinDate = selectedDate === '' ? new Date() : selectedDate;
				$('.datepicker.minDate').not('.startdate').datepicker('option', 'minDate', newMinDate);
      		}
		});
	});

	$(document).on('keyup blur', 'textarea', function() {
		var this_id = $(this).attr('data-target');
		var this_info = $(this).val();
		setInfo(this_id, this_info);
	});

});

function addDateToList(this_marker_id, this_marker_name, selectedDate) {	
	$('div[data-content="'+this_marker_id+'"]').find('.'+this_marker_name).text(selectedDate);
}

function setInfo(this_id, this_info) {
	$('div[data-content="'+this_id+'"] p.info').text(this_info);

	markerData = {
		'marker_id': this_id,
		'info': this_info
	}

	$.ajax({
		type: "POST",
		data: markerData,
		url: '/map/updatemarkerinfo/',
		success: function(e){
			//console.log(e);
		}	
	});
}


/**
 * Här ligger allt som har att göra med kartan men som inte ryms inom andra kategorier
 */

/* kartobjektet */
var map;
/* geocoderobjektet */
var geocoder;
/* resruttsobjektet */
var path;
/* array som håller koordinaterna för vår resrutt */
var path_coordinates = [];
/* variabler för mitten på vår karta */
var center_lat = 59.317305;   
var center_lng = 18.034087;
/* vår "flytande" markör */
var movable_marker;
/* alla statiska markörer */
var markers = [];
/* variabel som visar om rutten ska återvända till startpunkten eller ej */
var round_trip = false;
/* objekt som hjälper till så att alla markörer syns på kartan när en ny markör genereras */
var bounds;
/* variabler för våra hemmagjorda markörikoner */
var standardMarker = new google.maps.MarkerImage("/px/staticmarker.png", null, null, null, new google.maps.Size(44,60));
var personMarker = new google.maps.MarkerImage("/px/marker.png", null, null, null, new google.maps.Size(44,60));

getRoundTripFromDB();

/*
	När all kod har körts...
 */
$(document).ready(function(){

	getAllMarkersFromDB();

	/*
		När vårt element med Id "gmap" existerar
	 */
	$('#gmap').ready(function(){
	
		// Skapa ett Google Maps objekt med latitud och longitud
		var centerLatlng = new google.maps.LatLng(center_lat,center_lng);
		
		// Ange vilka inställningar som ska gälla för vår karta
		var mapOptions = {
			styles: styles,
			zoom: 6, // hur inzoomad kartan ska vara
			center: centerLatlng // vart mitten på kartan ska vara
		}
		
		/**
		 * Generera ett kartobjekt
		 */
		map = new google.maps.Map(document.getElementById("gmap"), mapOptions);
		
		/**
		 * Generera ett geocodeobjekt
		 */
		geocoder = new google.maps.Geocoder;

		/*
			Generera ett bounds-objekt
		 */
		bounds = new google.maps.LatLngBounds();

		/*
			För varje rad/varje objekt i vår array "markers"
		 */
		for (var i in markers) {

			// Skapa ett Google Maps objekt med latitud och longitud
			latlng = new google.maps.LatLng(markers[i].lat, markers[i].lng);
			// Skapa en markör med kartinfo och lägg till i vänsterspalten
			addLocation(latlng);

		}

		/*
			När man högerklickar ska ett infowindow dyka upp i vår rörliga markör
		 */
		google.maps.event.addListener(map, "rightclick", function(e){
			setMovableMarker(e.latLng);
		});

		/*
			Klicka på "Placera markör" tar bort movable_marker och sätter dit en permanent markör
		 */
		$(document).on('click', '#place_marker', function(e) {
			// Dölj vår tillfälliga markör "movable_marker"
			if(movable_marker) movable_marker.setMap(null);
			// Hämta vår movable_markers positionsobjekt, dvs latitud och longitud
			latlng = movable_marker.getPosition();
			// Skapa en fast markör, just nu med tom title och tomt infoWindow
			addLocation(latlng);
		});

		/*
			Söka på plats i vårt sökfält centrerar den rörliga markören på platsen
		 */
		$('#geocoding_form').on('submit', function(e) {
			e.preventDefault();

			var address = $('#geocoding_form_address').val();
			findByForm(address);

		});

		/*
			Klick på .delete-marker tar bort en markör
		 */
		$(document).on('click', '.delete-marker', function(e) {
			e.preventDefault();
			var marker_id = $(this).attr('data-target');
			if(confirm("Radera resmål?")) {
				removeLocationAndMarker(marker_id);
				deleteMarkerFromDB(marker_id);
			}
		});

		/*
			När man checkar i eller ur rutan för rundtur ändras vår resrutt
		 */
		$(document).on('change', '#round-trip', function(e) {
			// om rutan är ikryssad
			if($(this).prop('checked') === true) {
				// knyt ihop våra respunkter
				setRoundTrip(true);
			}
			else {
				// ta bort sträcket som knyter ihop resan
				setOneWayTrip();
			}

			changeRoundTripInDB();
		});	
	
	});

});

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
			//console.log(e);
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
			//console.log(e);
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
			//console.log(e);
		}	
	});

}

function getAllMarkersFromDB() {
	$.ajax({
		type: "POST",
		url: '/map/getallmarkers/',
		dataType: 'json',
		success: function(markers_from_db){
			console.log(markers_from_db);
			for(var i in markers_from_db) {
				this_marker_id = Number(markers_from_db[i].marker_id);
				this_latlng = new google.maps.LatLng(markers_from_db[i].lat, markers_from_db[i].lng);
				this_address = markers_from_db[i].address;
				this_arrival_date = markers_from_db[i].arrival_date;
				this_departure_date = markers_from_db[i].departure_date;
				this_info = markers_from_db[i].info;

				addStaticMarker(this_latlng, this_address, this_marker_id, this_arrival_date, this_departure_date, this_info);
				addToPlacesList(this_address, this_marker_id);
				addDateToList(this_marker_id, 'arrival_date', this_arrival_date);
				addDateToList(this_marker_id, 'departure_date', this_departure_date);
				setInfo(this_marker_id, this_info);
			}
			if(round_trip) {
				setRoundTrip();
			}
		}	
	});
}

function changeRoundTripInDB() {
	$.ajax({
		type: "POST",
		url: '/map/changeroundtrip/',
		success: function(e){
			//console.log(e);
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
				round_trip = true;
				//setRoundTrip();
				//$('input#roundtrip_arrival_date').addClass('visible');	
			}
			else {
				//setOneWayTrip();
			}
		}	
	});
}

function setDateInDB(marker_id, type_of_trip, date) {

	markerData = {
		'marker_id': marker_id,
		'type_of_trip': type_of_trip,
		'date': date
	}

	$.ajax({
		type: "POST",
		url: '/map/setdate/',
		data: markerData,
		success: function(e){
			//console.log(e);
		}	
	});
}
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
/**
 * Kartans utseende
 */

var styles = [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#352a40"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#352a40"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#352a40"
            },
            {
                "lightness": 37
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#352a40"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#352a40"
            },
            {
                "lightness": 15
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#3e606f"
            },
            {
                "weight": 2
            },
            {
                "gamma": 0.84
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "weight": 0.6
            },
            {
                "color": "#ffcc00"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#352a40"
            },
            {
                "lightness": 25
            }
        ]
    }
];

var styles_ = [
    {
        "featureType": "landscape.natural",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#FFCC00"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#352A40"
            },
            {
                "color": "#ffb700"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 700
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#352A40"
            }
        ]
    }
];
/**
 * Här ligger allt som har med vår rörliga markör att göra
 */

function setMovableMarker(currentLatLng) {

	var infowindow;
	
	if(movable_marker) movable_marker.setMap(null);
	
	movable_marker = new google.maps.Marker({
		position: currentLatLng, // var på kartan markören ska befinna sig
		map: map, // vilket kartobjekt som markören ska vara på
		draggable: true, // man kan dra och släppa markören
		icon: personMarker // vi anger vilken markör som ska visas
	});

	geocoder.geocode({'location': currentLatLng}, function(results, status) {

		if(status !== google.maps.GeocoderStatus.OK) {
			console.error(status);
			movable_marker.setMap(null);
			return false;
		}

		if(results[2]) {
			var address = results[2].formatted_address;
			infowindow = addInfoWindow(movable_marker, createMovableMarkerBtn(address));
			infowindow.open(map, movable_marker);
		} 
		else {
	        alert('Ingen address hittad!');
	        movable_marker.setMap(null);
		}

	});

	google.maps.event.addListener(movable_marker, "dragend", function(e){
		
		geocoder.geocode({'location': e.latLng}, function(results, status) {

			if(status !== google.maps.GeocoderStatus.OK) {
				console.error(status);
				return false;
			}

			if(results[2]) {
				var address = results[2].formatted_address;
				infowindow.setContent(createMovableMarkerBtn(address));
			} 
			else {
		        alert('Ingen address hittad!');
			}

		});

	});


}

function createMovableMarkerBtn(address) {
	var output = '';

	output += '<p><strong>Hittad adress</strong><br />'+address+'</p>';
	//if(!trip_ended) {
		output += '<a href="#" class="btn btn-ghost dark btn-sm btn-block" id="place_marker">Placera markör</a>';
	//}

	return output;
}
/**
 * Här ligger allt som har att göra med vår sträckning av reserutten
 */

function addToPath(latlng, marker_id, proceed) {

	if(typeof marker_id === 'undefined') return;

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
		strokeColor: '#ffcc00',
		strokeOpacity: .5,
		strokeWeight: 10
	});

	path.setMap(map);
}
/**
 * Places List är listan i vänsterspalten
 **/

function addToPlacesList(address, marker_id) {
	
	var output = '';

	output += '<div class="col-xs-12 place padding-sm-bottom" data-content="'+marker_id+'">';
	output += '<h5 class="text-white">'+address+'</h5>';
	output += '<p class="trip-header text-white arrival_date_wrap"><span class="text-light"><i class="fa fa-plane fa-fw fa-rotate-90 text-light"></i></span><span class="arrival_date"></span></p>';
	output += '<p class="trip-header text-white departure_date_wrap"><span class="text-light"><i class="fa fa-plane fa-fw text-light"></i></span><span class="departure_date"></span></p>';
	output += '<p class="info text-white padding-md-left"></p>';
	output += '</div>';

	if(marker_id === 0) { 
		$('#places-list-start').append(output);
		$('#places-list-end').append(output);
	}
	else {
		$('#places-list').append(output);
	}
	
}

function updatePlaceList(marker_id, address) {
	$('div[data-content="'+marker_id+'"] h5').text(address);
}
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
/**
 * Här ligger allt som har att göra med de utplacerade statiska markörerna
 */

function addStaticMarker(latlng, infoWindowContent, marker_id, arrival_date, departure_date, info) {

	arrival_date = typeof arrival_date !== 'undefined' ? arrival_date : '';
	departure_date = typeof departure_date !== 'undefined' ? departure_date : '';
	info = typeof info !== 'undefined' ? info : '';

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
	var infowindow = addInfoWindow(marker, createStaticMarkerContent(marker, marker_id, infoWindowContent, arrival_date, departure_date, info));
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
function addInfoWindow(marker, infoWindowContent, arrival_date, departure_date, info) {

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

function createStaticMarkerContent(marker, marker_id, address, arrival_date, departure_date, info) {

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
		output += '</div>';
	}

	output += '<div class="form-group">';
	output += '<label class="text-light">Fritext</label>';
	output += '<textarea name="info" data-target="'+marker_id+'" class="form-control margin-md-bottom">'+info+'</textarea>';
	output += '</div>';
	
	if(marker_id !== 0) {
		output += '<div class="form-group">';
		output += '<a href="#" class="delete-marker text-light pull-right padding-sm-bottom" data-target="'+marker_id+'"><i class="fa fa-trash fa-2x" aria-hidden="true"></i></a>';
		output += '</div>';
	}

	output += '</form>';
	output += '</div>';

	return output;
}

function setRoundTrip(addtopath) {

	var latlng = markers[0].getPosition();
	addToPath(latlng, addtopath);
	round_trip = true;
	$('#arrival-wrap').slideDown(500, function() {
		$(this).addClass('visible');	
	});
	$('#places-list-end').slideDown(500, function() {
		$(this).addClass('visible');	
	});
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
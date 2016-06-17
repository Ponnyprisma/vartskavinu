
var newMinDate = new Date();
$(document).ready(function() {
	/*
		När man klickar på ett element med data-toggle "offcanvas" ges .row-canvas en extra klass, "active" som gör att den slajdar in på mobil
	 */
	$('[data-toggle="offcanvas"]').click(function () {
		$('.row-offcanvas').toggleClass('active')
	});


	$('body').on('focus',".datepicker", function(){
		$(this).datepicker({
			minDate: newMinDate,
			onClose: function( selectedDate ) {
      			
      			newMinDate = selectedDate;
      		}
		});


	});

});
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
var standardMarker = new google.maps.MarkerImage("/px/marker_member-44x60-2x.png", null, null, null, new google.maps.Size(22,30));
var personMarker = new google.maps.MarkerImage("/px/marker_person-44x60-2x.png", null, null, null, new google.maps.Size(22,30));

/*
	När all kod har körts...
 */
$(document).ready(function(){

	/*
		När vårt element med Id "gmap" existerar
	 */
	$('#gmap').ready(function(){
	
		// Skapa ett Google Maps objekt med latitud och longitud
		var centerLatlng = new google.maps.LatLng(center_lat,center_lng);
		
		// Ange vilka inställningar som ska gälla för vår karta
		var mapOptions = {
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
			}
		});

		/*
			När man checkar i eller ur rutan för rundtur ändras vår resrutt
		 */
		$(document).on('change', '#round-trip', function(e) {
			// om rutan är ikryssad
			if($(this).prop('checked') === true) {
				// knyt ihop våra respunkter
				setRoundTrip();
			}
			else {
				// ta bort sträcket som knyter ihop resan
				setOneWayTrip();
			}
		});	
	
	});

});
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
			addStaticMarker(latlng, address);
			addToPlacesList(address);
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
		console.log(marker_id+'/'+i);
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
			infowindow.setContent(createStaticMarkerContent(marker, marker_id, address));
			updatePlaceList(marker_id, address);
		} 
		else {
	        alert('Ingen address hittad!');
		}
	}
}

function removeLocationAndMarker(marker_id) {
	
	$('.place[data-target="'+marker_id+'"]').fadeOut(200, function() {
		$(this).remove();
	});
	markers[marker_id].setMap(null);
	delete markers[marker_id];
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
                "color": "#e9e9e9"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dedede"
            },
            {
                "lightness": 21
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
                "color": "#ffffff"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "saturation": 36
            },
            {
                "color": "#333333"
            },
            {
                "lightness": 40
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
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f2f2f2"
            },
            {
                "lightness": 19
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#fefefe"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#fefefe"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
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
		output += '<a href="#" class="btn btn-primary btn-sm btn-block" id="place_marker">Placera markör</a>';
	//}

	return output;
}
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
	for(i in markers) {
		path_coordinates.push({'lat': markers[i].getPosition().lat(), 'lng': markers[i].getPosition().lng()});
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
/**
 * Places List är listan i vänsterspalten
 */

function addToPlacesList(address) {
	
	var marker_id = markers.length;

	var output = '';

	output += '<div class="col-xs-12 place" data-target="'+(marker_id-1)+'">';
	output += '<h5>'+address+'</h5>';
	output += '</div>';

	$('#places-list').append(output);

}

function updatePlaceList(marker_id, address) {
	$('div[data-target="'+marker_id+'"] h5').text(address);
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
	output += '<p><strong>'+address+'</strong></p>';	
	output += '<input type="text" class="datepicker">'
	if(marker === markers[0]) { 
		output += '<label><input type="checkbox" id="round-trip" value="1" ';
		if(round_trip) {
			output += ' checked="checked"';
		}
		output +='> Rundresa</label>'; 
	}
	else { 
		output += '<a href="#" class="delete-marker" data-target="'+marker_id+'">Radera markör</a>';
	}
	output += '</div>';

	return output;
}

function setRoundTrip() {

	var latlng = markers[0].getPosition();
	addToPath(latlng);
	round_trip = true;

}

function setOneWayTrip() {

	round_trip = false;
	updatePath(markers);

}

function updateMarkerTitles(markers) {
	var no = 0;

	for(var i in markers) {
		var title = no === 0 ? 'Resan startar här' : 'Resmål nummer '+no;
		markers[i].setTitle(title);
		no += 1;
	}
}
/* custom javascript and jquery */

var map;
var geocoder;
var path;
var path_coordinates = [];
var center_lat = 59.317305;   
var center_lng = 18.034087;
var movable_marker;
var markers = [];
var trip_ended = false;

var standardMarker = new google.maps.MarkerImage("/px/marker_member-44x60-2x.png", null, null, null, new google.maps.Size(22,30));
var personMarker = new google.maps.MarkerImage("/px/marker_person-44x60-2x.png", null, null, null, new google.maps.Size(22,30));

/*
	När all kod har körts...
 */
$(document).ready(function(){
	
	$('[data-toggle="offcanvas"]').click(function () {
		$('.row-offcanvas').toggleClass('active')
	});

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
			För varje rad/varje objekt i vår array "markers"
		 */
		for (var i in markers) {

			// Skapa ett Google Maps objekt med latitud och longitud
			latlng = new google.maps.LatLng(markers[i].lat, markers[i].lng);

			addLocation(latlng);

		}

		/*
			När man högerklickar ska en meny visas med olika alternativ
		 */
		google.maps.event.addListener(map, "rightclick", function(e){
			setMovableMarker(e.latLng);
		});

		/*
			Klicka på "Placera markör" i menyn tar bort movable_marker och sätter dit en permanent markör
		 */
		$(document).on('click', '#place_marker', function(e) {
			// Dölj vår tillfälliga markör "movable_marker"
			if(movable_marker) movable_marker.setMap(null);
			// Hämta vår movable_markers positionsobjekt, dvs latitud och longitud
			latlng = movable_marker.getPosition();
			// Skapa en fast markör, just nu med tom title och tomt infoWindow
			addLocation(latlng);
		});

		$('#geocoding_form').on('submit', function(e) {
			e.preventDefault();

			var address = $('#geocoding_form_address').val();
			findAddressLocation(address);

		});

		$(document).on('click', '.delete-marker', function(e) {
			e.preventDefault();
			var marker_id = $(this).attr('data-target');
			if(confirm("Radera resmål?")) {
				removeLocationAndMarker(marker_id);
			}
		});

		$('#end-trip').on('click', function(e) {
			e.preventDefault();

			if($(this).hasClass('trip-ended')) {
				openTrip();
				$(this).fadeOut(200, function() {
					$(this).text('Tillbaka till resans startpunkt').fadeIn(200);
					$(this).removeClass('trip-ended');
				});
			}
			else {
				endTrip();
				$(this).fadeOut(200, function() {
					$(this).text('Resrutt stängd. Klicka här för att öppna igen').fadeIn(200);
					$(this).addClass('trip-ended');
				});
			}	
			
		});
	
	});

});

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
			return false;
		}

		if(results[2]) {
			var address = results[2].formatted_address;
			infowindow = addInfoWindow(movable_marker, createMovableMarkerBtn(address));
			infowindow.open(map, movable_marker);
		} 
		else {
	        alert('Ingen address hittad!');
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
	if(!trip_ended) {
		output += '<a href="#" class="btn btn-primary btn-sm btn-block" id="place_marker">Placera markör</a>';
	}

	return output;
}

function createStaticMarkerContent(marker_id, address) {
	var output = '';

	output += '<div class="static-marker-content">';
	output += '<p><strong>'+address+'</strong></p>';

	if(marker_id)

	output += '<a href="#" class="delete-marker" data-target="'+(marker_id-1)+'">Radera markör</a>';
	output += '</div>';

	return output;
}

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
	var marker_id = markers.length;

	updateMarkerTitles(markers);

	// Funktion för att lägga till ett infofönster när man klickar på en markör
	var infowindow = addInfoWindow(marker, createStaticMarkerContent(marker_id, infoWindowContent));
	addToPath(latlng);	

	marker.addListener('dragend',function(e) {
        updatePath(markers);
        updateLocation(infowindow, e.latLng, marker_id);
    });

    marker.addListener('drag',function(e) {
        path.setOptions({strokeOpacity: .2});
    });

    

}

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

function addFinalLocation(latlng) {
	geocoder.geocode({'location': latlng}, geocb);

	function geocb(results, status) {

		if(status !== google.maps.GeocoderStatus.OK) {
			console.error(status);
			return false;
		}

		if(results[2]) {
			var address = results[2].formatted_address;
			addToPlacesList(address);
		} 
		else {
	        alert('Ingen address hittad!');
		}
	}
}

function updateLocation(infowindow, latlng, marker_id) {
	geocoder.geocode({'location': latlng}, geocb);

	function geocb(results, status) {

		if(status !== google.maps.GeocoderStatus.OK) {
			console.error(status);
			return false;
		}

		if(results[2]) {
			var address = results[2].formatted_address;
			infowindow.setContent(createStaticMarkerContent(marker_id, address));
			updatePlaceList(marker_id, address);
		} 
		else {
	        alert('Ingen address hittad!');
		}
	}
}

function addToPath(latlng) {

	path_coordinates.push({'lat': latlng.lat(), 'lng': latlng.lng()});
	
	if(path) path.setMap(null);

	createPath(path_coordinates);

}

function updatePath(markers) {

	path_coordinates = [];
	for(i in markers) {
		path_coordinates.push({'lat': markers[i].getPosition().lat(), 'lng': markers[i].getPosition().lng()});
	}

	if(trip_ended) {
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

function findAddressLocation(address) {
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

function removeLocationAndMarker(marker_id) {
	
	$('.place[data-target="'+marker_id+'"]').fadeOut(200, function() {
		$(this).remove();
	});
	markers[marker_id].setMap(null);
	delete markers[marker_id];
	updatePath(markers);
	updateMarkerTitles(markers);
}

function updateMarkerTitles(markers) {
	var no = 0;

	for(var i in markers) {
		var title = no === 0 ? 'Resan startar här' : 'Resmål nummer '+no;
		markers[i].setTitle(title);
		no += 1;
	}
}

function endTrip() {

	var latlng = markers[0].getPosition();
	addToPath(latlng);
	trip_ended = true;

}

function openTrip() {

	trip_ended = false;
	updatePath(markers);

}
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
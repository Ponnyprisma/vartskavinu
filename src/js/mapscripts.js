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
				setRoundTrip();
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
			for(var i in markers_from_db) {
				this_marker_id = Number(markers_from_db[i].marker_id);
				this_latlng = new google.maps.LatLng(markers_from_db[i].lat, markers_from_db[i].lng);
				this_address = markers_from_db[i].address;
				this_arrival_date = markers_from_db[i].arrival_date;
				this_departure_date = markers_from_db[i].departure_date;

				addStaticMarker(this_latlng, this_address, this_marker_id, this_arrival_date, this_departure_date);
				addToPlacesList(this_address, this_marker_id);
				addDateToList(this_marker_id, 'arrival_date', this_arrival_date);
				addDateToList(this_marker_id, 'departure_date', this_departure_date);
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
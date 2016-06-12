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
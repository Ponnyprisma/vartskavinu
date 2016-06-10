/* custom javascript and jquery */

var map;
var geocoder;
var path;
var path_coordinates = [];
var center_lat = 59.317305;   
var center_lng = 18.034087;
var movable_marker;
var markers = [];

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
			För varje rad/varje objekt i vår array "markers"
		 */
		for (var i in markers) {

			// Skapa ett Google Maps objekt med latitud och longitud
			latlng = new google.maps.LatLng(markers[i].lat, markers[i].lng);

			//addStaticMarker(latlng, 'Marker '+i, 'Vår nya markör med nummer '+i);
			addLocation(latlng);

		}

		/*
			Vänsterklick på kartan döljer menyn
		 */
		google.maps.event.addListener(map, "click", function(e){
			$('.rightclickpopup').fadeOut(100);
		});

		/*
			När man högerklickar ska en meny visas med olika alternativ
		 */
		google.maps.event.addListener(map, "rightclick", function(e){
			$('.rightclickpopup').fadeOut(100);
			setMovableMarker(e.latLng);
		});

		/*
			Klick på ett menyalternativ döljer menyn
		 */
		$(document).on('click', '.rightclickpopup_link', function(e) {
			e.preventDefault();
			$('.rightclickpopup').fadeOut(100);
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
			//addStaticMarker(latlng, '', '');
			addLocation(latlng);
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
}

/*
	Funktion för att generera menyn som visas när man högerklickar på kartan
 */
function showRightClickPopup(currentLatLng) {

	// Skapa variabeln som innehåller menyn
	var rightClickMenu;
	
	//Ta bort om det finns en befintlig dold meny
	$('.rightclickpopup').remove();
	
	// Skapa ett nytt div-element
	rightClickMenu = document.createElement("div");
	// Ge det en klass som heter "contextmenu"
	rightClickMenu.className  = 'rightclickpopup';
	// Fyll div.contextmenu med innehåll
	rightClickMenu.innerHTML = '<a class="rightclickpopup_link" id="place_marker" href="#">Placera markör</a>';
	// Lägg till div.contextmenu (vår meny) i kartans div-element
	$(map.getDiv()).append(rightClickMenu);
   	// Ge menyn rätt koordinater så den inte försvinner utanför kartan
	setMenuXY(currentLatLng);
	// Gör kartan synlig genom att ändra visibility till "visible"
	rightClickMenu.style.visibility = "visible";

}

function getCanvasXY(currentLatLng){
	var scale = Math.pow(2, map.getZoom());
	var nw = new google.maps.LatLng(
		map.getBounds().getNorthEast().lat(),
		map.getBounds().getSouthWest().lng()
	);
	var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
	var worldCoordinate = map.getProjection().fromLatLngToPoint(currentLatLng);
	var currentLatLngOffset = new google.maps.Point(
		Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
		Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
	);
	return currentLatLngOffset;
}

function setMenuXY(currentLatLng){
	var mapWidth = $(map.getDiv()).width();
	var mapHeight = $(map.getDiv()).height();
	var menuWidth = $('.rightclickpopup').width();
	var menuHeight = $('.rightclickpopup').height();
	var clickedPosition = getCanvasXY(currentLatLng);
	var x = clickedPosition.x ;
	var y = clickedPosition.y ;

	//if to close to the map border, decrease x position
	if((mapWidth - x ) < menuWidth) {
		x = x - menuWidth;
	}

	//if to close to the map border, decrease y position
	if((mapHeight - y ) < menuHeight) {
		y = y - menuHeight;
	}

	$('.rightclickpopup').css('left', x);
	$('.rightclickpopup').css('top', y);
};

function setMovableMarker(currentLatLng) {
	
	if(movable_marker) movable_marker.setMap(null);
	
	movable_marker = new google.maps.Marker({
		position: currentLatLng, // var på kartan markören ska befinna sig
		map: map, // vilket kartobjekt som markören ska vara på
		draggable: true, // man kan dra och släppa markören
		icon: personMarker // vi anger vilken markör som ska visas
	});

	showRightClickPopup(currentLatLng);

	google.maps.event.addListener(movable_marker, "mousedown", function(e){
		$('.rightclickpopup').fadeOut(100);
	});

	google.maps.event.addListener(movable_marker, "rightclick", function(e){
		showRightClickPopup(e.latLng);
	});


}

function addStaticMarker(latlng, titleContent, infoWindowContent) {
	// Skapa ett nytt markörobjekt
	var marker = new google.maps.Marker({
		position: latlng, // var på kartan markören ska befinna sig
		map: map, // vilket kartobjekt som markören ska vara på
		title: titleContent, // vad som ska visas när man för pekaren över markören
		icon: standardMarker, // vi anger vilken markör som ska visas
		animation: google.maps.Animation.DROP,
		draggable: true
	});

	// Funktion för att lägga till ett infofönster när man klickar på en markör
	addInfoWindow(marker, infoWindowContent);
	addToPath(latlng);

}

function addLocation(latlng, callback) {
	geocoder.geocode({'location': latlng}, geocb);

	function geocb(results, status) {

		if(status !== google.maps.GeocoderStatus.OK) {
			console.error(status);
			return false;
		}

		if(results[2]) {
			var address = results[2].formatted_address;
			addStaticMarker(latlng, address, address);
		} 
		else {
	        alert('Ingen address hittad!');
		}
	}
}

function addToPath(latlng) {

	path_coordinates.push({'lat': latlng.lat(), 'lng': latlng.lng()});
	
	if(path) path.setMap(null);

	path = new google.maps.Polyline({
		path: path_coordinates,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: .5,
		strokeWeight: 2
	});

	path.setMap(map);

}
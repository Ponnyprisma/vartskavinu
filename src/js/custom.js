/* custom javascript and jquery */

var center_lat = 59.317305;   
var center_lng = 18.034087;
var path = [];
var bounds = [];
var markers = [{'lat':'59.317305', 'lng':'18.034087'}, {'lat':'59.307205','lng':'18.014057'}];

$(document).ready(function(){
	
	$('#gmap').ready(function(){
	
		var centerLatlng = new google.maps.LatLng(center_lat,center_lng);
		console.log(centerLatlng);
		var mapOptions = {
		  zoom: 12,
		  center: centerLatlng
		}
		var map = new google.maps.Map(document.getElementById("gmap"), mapOptions);

		for (var i in markers) {

			thislatlng = new google.maps.LatLng(markers[i].lat,markers[i].lng);

			var marker = new google.maps.Marker({
				position: thislatlng,
				map: map,
				title: 'Marker '+i,
				infoWindow: {
					content: 'Marker '+i
				}
			});

			addInfoWindow(marker, 'Marker '+i);
			bounds.push(thislatlng);

			map.fitLatLngBounds(bounds);

		}
	
	});

});

function addInfoWindow(marker, content) {	
	var infowindow = new google.maps.InfoWindow({
		content: content
	});

	marker.addListener('click', function() {
		infowindow.open(marker.get('map'), marker);
	});
}
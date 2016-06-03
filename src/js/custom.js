/* custom javascript and jquery */

var center_lat = '59.317305';   
var center_lng = '18.034087';
var path = [];
var lat;
var lng;
var marker;
var infoWindow;
var service;

$(document).ready(function(){
	
	$('#gmap').ready(function(){
		
		map = new GMaps({
	
			div: '#gmap',
			lat: center_lat,
			lng: center_lng,
			zoom: 6,
			zoomControl : true,
			zoomControlOpt: {
				style : 'SMALL',
				position: 'TOP_RIGHT'
			},
			panControl : false,
	
		});

		map.setOptions({styles: styles});
		
		map.setContextMenu({
			control: 'map',
			options: [
				{
					action: function(e) {
						
						var index = map.markers.length;
						lat = e.latLng.lat();
						lng = e.latLng.lng();	
						setCityMarker(lat,lng);
						
					},
					title: 'Placera markör',
					name: 'place_marker'
				}
			]
		
		});

		$('#geocoding_form').submit(function(e){

			e.preventDefault();

			GMaps.geocode({
				address: $('#address_field').val(),
				callback: function(results, status) {
					if (status == 'OK') {
						var latlng = results[0].geometry.location;
						lat = latlng.lat();
						lng = latlng.lng();
						map.setCenter(lat, lng);
						setCityMarker(lat, lng);
					}
				}
			});
		});
					
	});

	$(document).on('click', '[data-type="slider"]', function(e) {
		var target = $(this).attr('data-target');
		$(this).siblings('div[data-content="mybox"]').slideToggle('slow');
		//$('[data-content="'+target+'"]').slideToggle('slow');
		$(this).children('i').toggleClass('fa-chevron-down fa-chevron-up');
		return false;
	});
		
});

function setCityMarker(lat,lng) {

	if(marker) {
		infoWindow.close(map,marker);
	}

	// Create infoWindow
	infoWindow = new google.maps.InfoWindow({
		content: ''
	});
	
	var opt = {
		lat : lat,
		lng : lng,
		callback : function(results, status) {

			console.log(results);

			if (status != google.maps.GeocoderStatus.OK) {
				console.error(status); return;
			}

			if(confirm('Menade du '+results[0].formatted_address+'?')) {

				marker = map.addMarker({	
					lat: lat,
					lng: lng,
					infoWindow: infoWindow
				});
				
				infoWindow.open(map,marker);

				path.push([lat, lng]);

				map.removePolylines();
				map.drawPolyline({
					path: path,
					strokeColor: '#131540',
					strokeOpacity: 0.6,
					strokeWeight: 6
				});

				$('#places').append(
					'<div class="place-box">' +
					results[0].formatted_address + '<br />' +
					'<a href="#" data-type="slider" data-target="mybox">Visa information <i class="fa fa-fw fa-chevron-down"></i></a>' +
					'<div class="place-box-info" data-content="mybox"><p>Här ska all info om destinationen/aktiviteten skrivas ut!</p></div>' +
					'</div>'
				);

			}
			
			infoWindow.setContent(results[0].formatted_address);
				
		}
	}

	GMaps.geocode(opt);

}

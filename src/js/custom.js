/* custom javascript and jquery */

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

$(document).ready(function(){
	
	$('#gmap').ready(function(){
								
		center_lat = '59.317305';	
		center_lng = '18.034087';
		var path = [];
		
		map = new GMaps({
	
			div: '#gmap',
			lat: center_lat,
			lng: center_lng,
			zoom: 6,
		    zoomControl : true,
		    zoomControlOpt: {
				style : 'SMALL',
				position: 'TOP_LEFT'
			},
			panControl : false,
	
		});

		map.setOptions({styles: styles});
		
		//GMaps.on('mouseup', map.map, function(e) { 
		//	//if(e.button == 2) { 
		//		var lat = e.latLng.lat();
		//		var lng = e.latLng.lng();  
		//		alert(lat);
		//		return false;
		//	//}
		//});
		
		map.setContextMenu({
			control: 'map',
			options: [{
				action: function(e) {
					var index = map.markers.length;
					var lat = e.latLng.lat();
					var lng = e.latLng.lng();
		
					//var template = $('#edit_marker_template').text();
		
					//var content = template.replace(/{{index}}/g, index).replace(/{{lat}}/g, lat).replace(/{{lng}}/g, lng);
		
					//if(map.markers.length == 0) {
					
						map.addMarker({
							
							lat: lat,
							lng: lng
							//title: 'Marker #' + index
							
						});
						
						$('#google_maps_latitud').val(lat);
						$('#google_maps_longitud').val(lng);

						path.push([lat, lng]);
					
					//}
					
					//else {
									
					//	var latlng = new google.maps.LatLng(lat, lng);
					//	map.markers[0].setPosition(latlng);
					//	$('#google_maps_latitud').val(lat);
					//	$('#google_maps_longitud').val(lng);
		
					//}
					
					var opt = {
						lat : lat,
						lng : lng,
						callback : function(results, status) {
							if (status == google.maps.GeocoderStatus.OK) {
								console.log(results);
								//$('#gmaps_address').text(results[0].formatted_address);
								//$('input#address').val(results[0].formatted_address);
							}
						}
					}
					
					GMaps.geocode(opt);

					map.removePolylines();
					map.drawPolyline({
						path: path,
						strokeColor: '#131540',
						strokeOpacity: 0.6,
						strokeWeight: 6
					});
					
				},
				title: 'Placera markör',
				name: 'place_marker'
			}]
		});
		
		//GMaps.on('click', map.map, function(event) {
		//	
		//	if(confirm('Placera markör?')) {
	    //
		//		var index = map.markers.length;
		//		var lat = event.latLng.lat();
		//		var lng = event.latLng.lng();
		//
		//		//var template = $('#edit_marker_template').text();
		//
		//		//var content = template.replace(/{{index}}/g, index).replace(/{{lat}}/g, lat).replace(/{{lng}}/g, lng);
		//
		//		if(map.markers.length == 0) {
		//		
		//			map.addMarker({
		//				
		//				lat: lat,
		//				lng: lng
		//				//title: 'Marker #' + index
		//				
		//			});
		//		
		//		} else {
		//						
		//			var latlng = new google.maps.LatLng(lat, lng);
		//			map.markers[0].setPosition(latlng);
		//			$('#google_maps_latitud').val(lat);
		//			$('#google_maps_longitud').val(lng);
		//
		//		}
		//	
		//	}
		//
		//});
					
	});
		
});

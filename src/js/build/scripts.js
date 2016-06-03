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

		/*map.setOptions({styles: styles});*/
		
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




					path.push([lat, lng]);
					
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

	$( ".toggle" ).click(function() {
		$( "p" ).slideToggle( "slow" );
	});
		
});

function setCityMarker(lat,lng) {

	if(marker) {
		infoWindow.close(map,marker);
	}


            GMaps.geocode({
                address: $('#address_feild').val(),
                callback: function(results, status) {
                    if (status == 'OK') {
                        var latlng = results[0].geometry.location;
                        map.setCenter(latlng.lat(), latlng.lng());
                        map.addMarker({
                            lat: latlng.lat(),
                            lng: latlng.lng()
                        });
                    }
                }
            });
        
				

	// Create infoWindow
	infoWindow = new google.maps.InfoWindow({
		content: ''

	});
	
	marker = map.addMarker({	
		lat: lat,
		lng: lng,
		infoWindow: infoWindow
	});
	
	infoWindow.open(map,marker);

	path.push([lat, lng]);
	
	var opt = {
		lat : lat,
		lng : lng,
		callback : function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				console.log(results);
				infoWindow.setContent(results[0].formatted_address);
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
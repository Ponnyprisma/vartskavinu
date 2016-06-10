/* custom javascript and jquery */

var center_lat = '59.317305';   
var center_lng = '18.034087';
var path = [];
var lat;
var lng;
var marker;
var markers;
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


	/*$(document).ready(function(){
	$('#mobile-toggle').on('click', function(){

		$('#travelPlanner').slideToggle();

		$(this).children('i').toggleClass('fa fa-angle-down  fa fa-angle-up');
		return false;
		});
	});*/

	$(document).ready(function () {
  		$('[data-toggle="offcanvas"]').click(function () {
   			$('.row-offcanvas').toggleClass('active')
  		});
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

			//if(confirm('Menade du '+results[0].formatted_address+'?')) {

				marker = map.addMarker({	
					lat: lat,
					lng: lng,
					infoWindow: infoWindow,
					click: function(e) {
						console.log(this.infoWindow);
						infoWindow.open(map,this);
					}
				});

				// infoWindow.open(map, marker);

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
					'<div class="place-box-info" data-content="mybox"><p>Här ska vi gå och se Cats the Musical! Sen äter vi på Lilla Tjorven som ligger precis bredvid. Vi har bord klockan 21:30.</p></div>' +
					'</div>'
				);
			//}
			
			var contentString = '<div id="content">'+
				'<div id="siteNotice">'+
				'</div>'+
				'<h1 id="firstHeading" class="firstHeading">'+results[0].formatted_address+'</h1>'+
				'<div id="bodyContent">'+
				'<form><input type="date"><input type="time"><br><textarea rows="4" cols="40">Skriv här</textarea><br><input type="submit"></form>'+
				'</div>'+
				'</div>';

			infoWindow.setContent(contentString);


		}

	}

	GMaps.geocode(opt);

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
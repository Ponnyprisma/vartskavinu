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
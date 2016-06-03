/* custom javascript and jquery */

var center_lat = '59.317305';   
var center_lng = '18.034087';
var path = [];
var lat;
var lng;

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
			options: [{
				action: function(e) {
					var index = map.markers.length;
					lat = e.latLng.lat();
					lng = e.latLng.lng();
					
					map.addMarker({
						
						lat: lat,
						lng: lng,
                        infoWindow: {
                            content: '<div><form action="" method="POST"><div><input type="date" name="date"><input type="time" name="time"></div><textarea name="textarea" rows="10" cols="50">Write something here</textarea><input class="formen" type="submit" value="Lägg till!"></form></div>'
                        }
                       
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


    $('#geocoding_form').submit(function(e){

            e.preventDefault();

            GMaps.geocode({
                address: $('#address').val(),
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
        });
				
	});

    $( "#toggle" ).click(function() {
        $( "p" ).slideToggle( "slow" );
    });
		
});

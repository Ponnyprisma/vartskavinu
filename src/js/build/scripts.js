/* custom javascript and jquery */

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

/**
 * Places List är listan i vänsterspalten
 **/

function addToPlacesList(address, marker_id) {
	
	var output = '';

	output += '<div class="col-xs-12 place padding-sm-bottom" data-content="'+marker_id+'">';
	output += '<h5 class="text-white">'+address+'</h5>';
	output += '<p class="trip-header text-white arrival_date_wrap"><span class="text-light"><i class="fa fa-plane fa-fw fa-rotate-90 text-light"></i></span><span class="arrival_date"></span></p>';
	output += '<p class="trip-header text-white departure_date_wrap"><span class="text-light"><i class="fa fa-plane fa-fw text-light"></i></span><span class="departure_date"></span></p>';
	output += '</div>';

	if(marker_id === 0) { 
		$('#places-list-start').append(output);
		$('#places-list-end').append(output);
	}
	else {
		$('#places-list').append(output);
	}
	
}

function updatePlaceList(marker_id, address) {
	$('div[data-content="'+marker_id+'"] h5').text(address);
}
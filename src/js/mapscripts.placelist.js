/**
 * Places List är listan i vänsterspalten
 */

function addToPlacesList(address, marker_id) {
	
	//var marker_id = (markers.length-1);

	var output = '';

	output += '<div class="col-xs-12 place" data-content="'+marker_id+'">';
	output += '<h5 class="text-white">'+address+'</h5>';
	output += '<p class="text-white"><i class="fa fa-plane fa-fw"></i><span class="arrival_date"></span></p>';
	output += '<p class="text-white"><i class="fa fa-plane fa-fw fa-rotate-90"></i><span class="departure_date"></span></p>';
	output += '</div>';

	$('#places-list').append(output);

}

function updatePlaceList(marker_id, address) {
	$('div[data-content="'+marker_id+'"] h5').text(address);
}
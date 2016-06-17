/**
 * Places List är listan i vänsterspalten
 */

function addToPlacesList(address) {
	
	var marker_id = (markers.length-1);

	var output = '';

	output += '<div class="col-xs-12 place" data-content="'+marker_id+'">';
	output += '<h5 class="text-white">'+address+'</h5>';
	output += '<p class="arrival_date text-white"></p>';
	output += '<p class="departure_date text-white"></p>';
	output += '</div>';

	$('#places-list').append(output);

}

function updatePlaceList(marker_id, address) {
	$('div[data-target="'+marker_id+'"] h5').text(address);
}
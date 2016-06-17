/**
 * Places List är listan i vänsterspalten
 */

function addToPlacesList(address) {
	
	var marker_id = markers.length;

	var output = '';

	output += '<div class="col-xs-12 place" data-target="'+(marker_id-1)+'">';
	output += '<h5 class="text-white">'+address+'</h5>';
	output += '</div>';

	$('#places-list').append(output);

}

function updatePlaceList(marker_id, address) {
	$('div[data-target="'+marker_id+'"] h5').text(address);
}
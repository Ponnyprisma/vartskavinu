var newMaxDate = null;
var newMinDate = new Date();

$(document).ready(function() {
	/*
		När man klickar på ett element med data-toggle "offcanvas" ges .row-canvas en extra klass, "active" som gör att den slajdar in på mobil
	 */
	$('[data-toggle="offcanvas"]').click(function () {
		$('.row-offcanvas').toggleClass('active')
	});

	$('body').on('focus',".datepicker:not(.startdate)", function(){
		$(this).datepicker({
			minDate: newMinDate,
			maxDate: newMaxDate,
			dateFormat: "yy-mm-dd",
			onClose: function( selectedDate ) {
				addDateToList($(this), selectedDate);
      			if ($(this).hasClass('minDate')) {
					newMinDate = selectedDate;
      			}
      			else if ($(this).hasClass('maxDate')) {
					newMaxDate = selectedDate;
					$('.datepicker.minDate').datepicker('option', 'maxDate', newMaxDate);
      			}
      		}
		});
	});

	$('body').on('focus',".datepicker.startdate", function(){
		$(this).datepicker({
			minDate: new Date(),
			maxDate: newMaxDate,
			dateFormat: "yy-mm-dd",
			onClose: function( selectedDate ) {
				addDateToList($(this), selectedDate);
				newMinDate = selectedDate === '' ? new Date() : selectedDate;
				$('.datepicker.minDate').not('.startdate').datepicker('option', 'minDate', newMinDate);
      		}
		});
	});

});

function addDateToList(thisMarker, selectedDate) {
	var this_marker_id = thisMarker.attr('data-target');
	var this_marker_name = thisMarker.attr('name');
	$('div[data-content="'+this_marker_id+'"]').find('.'+this_marker_name).text(selectedDate);
}
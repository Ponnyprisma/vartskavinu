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
				var this_marker_id = $(this).attr('data-target');
				var this_marker_name = $(this).attr('name');
				addDateToList(this_marker_id, this_marker_name, selectedDate);
				setDateInDB(this_marker_id, this_marker_name, selectedDate);
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
				var this_marker_id = $(this).attr('data-target');
				var this_marker_name = $(this).attr('name');
				addDateToList(this_marker_id, this_marker_name, selectedDate);
				setDateInDB(this_marker_id, this_marker_name, selectedDate);
				newMinDate = selectedDate === '' ? new Date() : selectedDate;
				$('.datepicker.minDate').not('.startdate').datepicker('option', 'minDate', newMinDate);
      		}
		});
	});

});

function addDateToList(this_marker_id, this_marker_name, selectedDate) {	
	$('div[data-content="'+this_marker_id+'"]').find('.'+this_marker_name).text(selectedDate);
}


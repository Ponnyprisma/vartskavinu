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
			onClose: function( selectedDate ) {
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
			onClose: function( selectedDate ) {
				newMinDate = selectedDate === '' ? new Date() : selectedDate;
				$('.datepicker.minDate').not('.startdate').datepicker('option', 'minDate', newMinDate);
      		}
		});
	});

});
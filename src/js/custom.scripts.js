
var newMinDate = new Date();
$(document).ready(function() {
	/*
		När man klickar på ett element med data-toggle "offcanvas" ges .row-canvas en extra klass, "active" som gör att den slajdar in på mobil
	 */
	$('[data-toggle="offcanvas"]').click(function () {
		$('.row-offcanvas').toggleClass('active')
	});


	$('body').on('focus',".datepicker", function(){
		$(this).datepicker({
			minDate: newMinDate,
			onClose: function( selectedDate ) {
      			
      			newMinDate = selectedDate;
      		}
		});


	});

});
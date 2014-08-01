$(document).ready(function(){
	$('.sidebar').on('click', function(e) {
	    e.stopPropagation();
	});

	$(document).on('click', function (e) {
		$('.sidebar').hide();
		$('.pt-page-1 .page-container').removeClass('blur');

	});


	$('.item-title, .item-desc, .item-icon').on('click', function(e){
		e.stopPropagation();
		console.log('in');
		if($('.sidebar:visible')[0] == undefined){ // sidebar hidden
			$('.sidebar').slideDown(100);
			$('.sidebar').show();
			$('.pt-page-1 .page-container').addClass('blur');
		}
		else if($('.sidebar:hidden')[0] == undefined){ // sidebar visible
			$('.sidebar').hide();
			$('.pt-page-1 .page-container').removeClass('blur');
		}
	})
});
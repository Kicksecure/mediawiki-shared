/*
EnhanceHeadlines Gadget - JS Initialisation, Setup, Events. Adds some additional functionality to headlines except if prevented by special class
See detailed documentation in Dev/mediawiki
deferrable:YES -- Because it's an augmentation and is not a needed depedency
*/

(function() {

	if( $('[data-pageMeta-preventEnhanceHeadlines]').length ) return;

	let shareTtTemplate = $('<span class="share-tooltip"></span>');

	$('h1,h2,h3').find('.mw-headline').parent().each( function() {

		// Add Share Button

		let shareTt = shareTtTemplate.clone();
		$(this).append( shareTt );
		shareTt.attr( 'data-anchor', $(this).find('span[id]').eq(0).attr('id') );
		shareTt.attr( 'data-chapter', $(this).find('.mw-headline').eq(0).text() );
		shareTt.shareTooltip('init');
	});

})();
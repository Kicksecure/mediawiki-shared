/*
Admin Server Notice - Small notice to indicate Stage Server
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is just an augmentation
*/

(function() {

	if( $( 'head meta[name="server-type-stage"]' ).length ) {

		let indicator = $(`
			<div id="stage-server-indicator">
				<i class="fa-solid fa-s"></i>
				<i class="fa-solid fa-exclamation"></i>
				<p>This is the stage<br>server for this wiki.</p>
			</div>
		`);

		$('body').append( indicator );

	}

})();

/*
[[Category:MultiWiki]]
*/
/*
MiniModal Gadget - JS Initialisation, Setup, Events. A fully functional but minimal modal
See detailed documentation in Dev/mediawiki
deferrable:NO -- Because a other scripts are dependent on it
*/

(function() {

	// Init a selection of MiniModals

	function init( modal ) {

		modal.each( function() {
			if( ! modal.hasClass('mini-modal') || ! modal.attr('id') || modal.hasClass('init-complete') ) return;
			else modal.addClass('init-complete');

			let temp = $(`<div style="display: none;" id="mini-modal-temp-container-${Math.random().toString().substring(2)}"></div>`);
			$('body').append( temp );
			temp.append( modal.children() );

			modal.empty().append(''
				+ '<div class="underlay"></div>'
				+ '<i class="fas fa-times mm-close"></i>'
				+ '<div class="content"></div>'
			);

			modal.children( '.content' ).append( temp.children() );
			temp.remove();

			// Events

			// Event : Click close or underlay
			modal.children('.underlay, .mm-close').on( 'click', () => hide( modal ) );
		});
	}

	function show( modal ) {
		init( modal );
		modal.addClass('active');
		if( modal.attr('data-url-hash') ) mwDev.tools.hashControl.set( modal.attr('data-url-hash') );
		modal.trigger( 'shown.miniModal' );
	}

	function hide( modal ) {
		init( modal );
		modal.removeClass('active');
		if( modal.attr('data-url-hash') ) mwDev.tools.hashControl.set( '' );
		modal.trigger( 'hidden.miniModal' );
	}

	// JQUERY extension

	$.fn.miniModal = function(command) {
		switch( command ) {
			case 'init': init( $(this) ); break;
			case 'show': show( $(this) ); break;
			case 'hide': hide( $(this) ); break;
			case 'checkForModalsCalledByHash' :
				let hashModal = $( `.mini-modal[data-url-hash="${ mwDev.tools.hashControl.get() }"]` );
				if( hashModal.length ) show( hashModal );
			break;
		}
	};

	// Event : URL popstate. With no hash close all modals that are active

	mwDev.tools.hashControl.register( '', () => $( '.mini-modal.active' ).each( (index,modal) => hide( $(modal) ) ) );

})();

/*
[[Category:MultiWiki]]
*/
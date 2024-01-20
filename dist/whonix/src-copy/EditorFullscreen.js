/*
EditorFullscreen Gadget - JS Initialisation, Setup, Events
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is just an augmentation
*/

(function () {

	if( $('#editform').length ) setTimeout( function() {

		// Setup

		var editor;
		if( $('#editform .ace_editor' ).length ) {
			$('#editform .ace_editor' ).attr('id','editform-ace-editor');
			editor = ace.edit('editform-ace-editor');
			$('#editform .ui-resizable' ).attr('data-initial-height',$('#editform .ui-resizable' ).outerHeight());
		}

		$('#wikiEditor-ui-toolbar').append($( ''
			+ '<span class="editor-fullscreen">'
			+  '<i class="open-fullscreen fas fa-expand" title="Go to fullscreen editing"></i>'
			+  '<i class="close-fullscreen fas fa-compress-alt" title="Go to windowed editing"></i>'
			+ '</span>'
		));

		// Events

		$('#wikiEditor-ui-toolbar .editor-fullscreen').on( 'click', function() {
			let currentlyActive = $('body').hasClass('editform-fullscreen-active');
			$('body').toggleClass('editform-fullscreen-active');

			if( currentlyActive ) {
				if( editor ) editor.resize();
				if( editor ) {
					$('#editform .ui-resizable' ).height( $('#editform .ui-resizable' ).attr('data-initial-height') );
					editor.resize();
				} else {
					$('#editform #wpTextbox1').height('');
				}
			} else {
				let newHeight = $(window).height() - 20
					- $('#wikiEditor-ui-toolbar').outerHeight()
					- $('#editform .editOptions').outerHeight()
					- ( $('#editform .codeEditor-status').length ? $('#editform .codeEditor-status').outerHeight() : 0 )
					- ( $('#msupload-div').length ? $('#msupload-div').outerHeight() : 0 );

				$('.wikiEditor-ui-text').height( newHeight );

				if( editor ) {
					$('#editform .ace_editor' ).parent().height( newHeight );
					editor.resize();
				} else if( $('.CodeMirror').length ) {
					$('#editform .CodeMirror').height( newHeight );
				} else {
					$('#editform #wpTextbox1').height( newHeight );
				}
			}
		});

	}, 500 );

})();

/*
[[Category:MultiWiki]]
*/
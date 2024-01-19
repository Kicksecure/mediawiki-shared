/*
Discover Hidden Elements - Open Headlines and Footnotes that are linked to but hidden
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is a standalone gadget / augmentation
*/

(function() {

	// Search and apply to all footnotes, all reverse footnotes and all headlines, but NOT headlines for tab controller tabs (because they are already handled)

	$( '[id^="cite_note-"], [id^="cite_ref-"], .mw-headline[id]:not(.tcc-title > * > *)' ).each( function() {

		let elem = $(this);

		mwDev.tools.hashControl.register( elem.attr('id'), function() {
			let parents = elem.parents('.tcc-section, .mw-collapsible.mw-collapsed');

			// If element is child to none of these no action is needed
			if( parents.length == 0 ) return;

			// Click all tab controller parents, from nearest to root, to farthest
			$( parents.get().reverse() ).each( function() {
				/*
				Note to Devs, 2023-08-11: The mw-collapsible line 28 is commented out, because it seems that mw-collapsible does have the desired behavior
				(open when child is referenced in hash) automatically, so there is no need to add it again. However as this behavior is not
				documented it might disappear in the future, so just comment in this line to achieve the effect
				*/
				if( $(this).hasClass('tcc-section') ) $(this).tabContentController('select');
				// else $(this).children('.mw-collapsible-toggle')[0].click();
			});

			// Scroll to position
			setTimeout( () => $('html, body').animate( { scrollTop: elem[0].getBoundingClientRect().top + window.pageYOffset - 70  }, 500 ), 100 );
		}, true );

	});

})();

/*
[[Category:MultiWiki]]
*/
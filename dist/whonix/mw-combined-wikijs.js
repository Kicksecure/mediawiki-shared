/* === build-mw-combine.php : This file is auto-generated from the 'wikijs' category of whonix ================================================== */





/* === mw-combine.php : This wrapper is auto-generated to make all JavaScript wait for this event ================================================== */





/*
Establishes global mwDev object, measures page loading, constructs promise-like structure to make custom JS wait for mediawiki JS
See Dev/mediawiki for more info
deferrable:NO -- This is essential for the rest of the loading process
*/


/* jshint esversion: 8 */


// ----------
// 0. Globals


// tool - tool scripts for dev to use across all scripts, test - testing tools, data - general data to use across all scripts, log - global logging data, app - global data between scripts
window.mwDev = { tools: { test: {} }, data: { log: {}, app: {} } };

let urlObj = new URL(window.location);
window.mwDev.data.app.baseUrl = urlObj.origin + urlObj.pathname.replace('/wiki/Homepage','');


// ------------
// 1. Dev Tools


window.mwDev.tools.test.pageLoading = (function() {
	let events = [];
	return function( event ) {
		let now = new Date();
		events.push( [ event, now ] );
		console.info( 'mwDev.tools.test.pageLoading : event "' + event + '" at ' + now.toLocaleTimeString('en-GB', {
			hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits:3,
		}));
		for( var i = 0; i < events.length - 1; i++ ) {
			// output the diff to all previous events
			console.info( 'mwDev.tools.test.pageLoading : diff (' + event + ',' + events[i][0] + ') = ' + (now.valueOf() - events[i][1]) + ' ms'  );
		}
	};
})();

// Pagespeed measurement
mwDev.tools.test.pageLoading('pageLoadStart');


// ---------
// 2. All JS
// This is available after Common.js is loaded


function triggerWhenReady() {
	// URL parameter to delay page loading
	if( (new URLSearchParams(window.location.search)).get('delayedPageLoad') ) {
		document.body.style.display = 'none';
		setTimeout( function() {
			document.body.style.display = 'block';
		}, 20000 );
	}
	
	// Setup for controlled deactivation of isolated scripts
	let dontloadString = new URLSearchParams(window.location.search).get("dontload");
	mwDev.data.log.jsload = {};
	if( dontloadString && typeof dontloadString == "string" ) {
		dontloadString.split(",").forEach( function(el) {
			mwDev.data.log.jsload[ "MediaWiki:" + el + ".js" ] = false;
		});
	}






/* === JsPerformanceTests.js ================================================== */





if( mwDev.data.log.jsload['JsPerformanceTests.js'] !== false ) {

/*
Adds 2 JS test methods to global mwDev.tools.test object to measure site performance on the browser side
See detailed documentation in Dev/mediawiki
deferrable:NO -- This scripts tests performance and needs to be fired asap
*/

(function() {

	// mwDev is globally available

	let jammerHandle = null;
	mwDev.tools.test.jsJammer = function( bursts = 10, pause = 300, runs = 100 ) {
		if( bursts == false ) {
			clearInterval( jammerHandle );
			return;
		}

		console.info( 'mwDev.tools.test.jsJammer : starting ' + runs + ' runs, ' + bursts + ' bursts, ' + pause + ' pause' );

		var count = runs;
		jammerHandle = setInterval( function() {
			count--;
			if( count <= 0 ) {
				clearInterval( jammerHandle );
				console.info( 'mwDev.tools.test.jsJammer : runs completed' );
				return;
			}

			console.info( 'mwDev.tools.test.jsJammer : ' + count + ' runs to go' );

			// Performance intensive infinite loop
			let a = [];
			for( var i = 0; i < bursts * 1000000; i++ ) {
				if( typeof a == 'object' ) {
					a = 0;
				} else {
					a = [];
				}
			}
		}, pause );
	};

	mwDev.tools.test.scrollPageTest = function( time = 600, runs = 10 ) {

		console.info( 'mwDev.tools.test.scrollPageTest : starting ' + runs + ' runs, ' + time + ' time' );

		var count = runs;
		var start, diff;

		function fn1() {
			start = Date.now();
			$("html").animate({ scrollTop: $(document).height() }, time, fn2 );
		}

		function fn2() {
			$("html").animate({ scrollTop: 0 }, time, function() {
				count--;
				if( count <= 0 ) {
					console.info( 'mwDev.tools.test.scrollPageTest : runs completed' );
					return;
				}

				diff = Date.now() - start;
				console.info( 'mwDev.tools.test.scrollPageTest : ' + count + ' runs to go. Current, expected: '
					+ ( 2 * time ) + ', measured: ' + diff + ', deviation: '
					+ ( 100 * ( diff - 2 * time ) / ( 2 * time ) ).toFixed(2) + '%'
				);

				fn1();
			});
		}

		fn1();
	};

})();

/*
[[Category: MultiWiki]]
*/

mwDev.data.log.jsload['JsPerformanceTests.js'] = true;


}





/* === DevTools.js ================================================== */





if( mwDev.data.log.jsload['DevTools.js'] !== false ) {

/*
Adds developer tools which are usable via the console
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is an augmentation
*/

(function() {

	// mwDev.tools is globally available

	// ---------------------------------------------------------
	// 1. Replace all references to files in the wiki with links

	mwDev.tools.fileRefsToLinks = function( selector = $("#mw-content-text *"), linkAttr = { target: '_blank' }, query = { action: 'edit' } ) {
		selector.contents().each( function() {
			// If not Textnode, return
			if( this.nodeType != 3 ) return;
			// If parent is already <a> return
			if( $(this).parent().prop('tagName') == 'A' ) return;
			// If not matching return
			let ref = this.textContent.match( /Media(W|w)iki:[^\.]+.(js|css)/ );
			if( ! ref ) return;

			let queryString = '';
			for( let key in query ) {
				if( ! queryString ) queryString +=`?${key}=${query[key]}`;
				else queryString +=`&${key}=${query[key]}`;
			}

			let linkAttrString = '';
			for( let key in linkAttr ) linkAttrString +=` ${key}="${linkAttr[key]}"`;

			let parts = this.textContent.split(ref[0]);
			let newNodes = [];
			if( parts[0] ) newNodes.push( $( document.createTextNode( parts[0] ) ) );
			newNodes.push( $(`<a href="/wiki/${ref[0]}${queryString}"${linkAttrString}>${ref[0]}</a>`) );
			if( parts[1] ) newNodes.push( $( document.createTextNode( parts[1] ) ) );

			// Replace old TextNode with newNode
			$(this).replaceWith( newNodes );
		});
	};

	// Execute always if on Build.json (if not in edit mode)
	if( mw.config.get('wgPageName') == 'MediaWiki:Build.json'
		&& (new URLSearchParams( window.location.href )).get('action') != 'edit'
	) mwDev.tools.fileRefsToLinks ();

})();

/*
[[Category: MultiWiki]]
*/

mwDev.data.log.jsload['DevTools.js'] = true;


}





/* === BackToTopButton.js ================================================== */





if( mwDev.data.log.jsload['BackToTopButton.js'] !== false ) {

/*
JS-Button for Scrolling Back to the Top
See detailed documentation in Dev/mediawiki
deferrable:YES -- This functionality can come a little bit later in the loading process
*/

(function () {

	let setup = {
		visibleTimeAfterScroll: 2000,
		scrollToTopTime: 300,
	};

	let button = $(''
		+ '<div id="back-to-top-button">'
		+  '<i class="fas fa-chevron-up"></i>'
		+ '</div>'
	);

	let windowIsScrolling = false;
	let intervalHandle;

	// Functions

	function hideButton() {
		button.animate( { opacity: 0 }, 300, function() {
			button.css( { display: 'none' } );
			windowIsScrolling = false;
		});
	}

	// Setup

	$(document.body).append(button);

	// Events

	button.on( 'click', function() {
		$("html, body").animate({ scrollTop: 0 }, setup.scrollToTopTime);
	});

	$(window).on('scroll', function() {
		clearInterval( intervalHandle );
		intervalHandle = setTimeout( hideButton, setup.visibleTimeAfterScroll );

		if( ! windowIsScrolling ) {
			button.css( { display: 'block', opacity: 0 } );
			button.animate( { opacity: 1 }, 300 );
		}

		windowIsScrolling = true;
	});

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['BackToTopButton.js'] = true;


}





/* === PayViaPaypal.js ================================================== */





if( mwDev.data.log.jsload['PayViaPaypal.js'] !== false ) {

/*
Adds a PayPal payment module to the given DOM elements
See detailed documentation in Dev/mediawiki
deferrable:YES -- This script needs a little bit to load anyways
*/

(function() {

	// 0. Data

	let standards = {
		minimumDollars: 5, // in full dollars
		presetDollars: {
			once: [20, 50, 200, 500, 1000],
			monthly: [10, 20, 50, 100, 200],
			yearly: [20, 50, 100, 200, 500],
		}
	};

	let intervalModes = {
		once: '_xclick',
		subscription: '_xclick-subscriptions',
	};

	// 1. Elements

	let template = $(`
    <div class="interval">
      <div class="options">
        <span class="once">Once</span>
        <span class="monthly">Monthly</span>
        <span class="yearly">Yearly</span>
      </div>
      <div class="error">Please select an interval</div>
    </div>

    <div class="amount">
      <div class="options">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span class="manual">
          <input id="input-amount" type="text" autocomplete="off" />
        </span>
      </div>

      <div class="interval-hint">
        <span>➥</span>
        Please select interval
      </div>

      <div class="error">
        Please select an amount of min
        $<span class="min"></span>
      </div>
    </div>

    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
      <input type="hidden" name="business" value="patrick_schleizer@web.de">
      <input type="hidden" name="currency_code" value="USD">
      <input type="hidden" name="item_name" value="Plus Support">
      <input type="hidden" name="cmd">
      <input type="hidden" name="no_note" value="1">
      <button type="submit" class="submit">
        DONATE
        <span>via PayPal</span>
    </form>
  `);

	let elementTemplates = {
		// Time parameters. Syntax: p3 times t3, e.g. p3=6&t3=M -> 6 months, p3=1&t3=Y -> 1 year
		interval: {
			monthly: $('<input type="hidden" name="p3" value="1"><input type="hidden" name="t3" value="M"><input type="hidden" name="src" value="1">'),
			yearly: $('<input type="hidden" name="p3" value="1"><input type="hidden" name="t3" value="Y"><input type="hidden" name="src" value="1">'),
		},
		amount: {
			once: $('<input type="hidden" name="amount">'),
			subscription: $('<input type="hidden" name="a3">'),
		},
	};

	// 2. Methods

	function isCurrentAmountValid(amount) {
		let parsedAmount = Number.parseFloat(amount);
		return typeof parsedAmount == 'number' && Number.isNaN(parsedAmount) == false && parsedAmount >= standards.minimumDollars;
	}

	function fillAmountsByInterval(root, interval) {
		root.find('.amount span').each((index, spanAmount) => {
			$(spanAmount).text(standards.presetDollars[interval][index]);
		});
	}

	// 3. jQuery Extension

	$.fn.payViaPaypal = function(action) {

		// Only allow 'init' at the moment (extendable later)
		if (action != 'init') return;

		$(this).each(function() {
			// Prevent double initialization
			if ($(this).hasClass('js-fully-loaded')) return;

			let amount;

			$(this).html(template.clone());

			let formElements = {
				interval: {
					monthly: elementTemplates.interval.monthly.clone(),
					yearly: elementTemplates.interval.yearly.clone()
				},
				amount: {
					once: elementTemplates.amount.once.clone(),
					subscription: elementTemplates.amount.subscription.clone()
				},
			};

			let root = $(this);
			let form = root.children('form');
			let inputCmd = form.children('input[name=cmd]');

			// 4. Events

			root.find('.amount span').on('click', function() {
				if (!inputCmd.val()) {
					root.addClass('paypal-interval-error');
					return;
				}

				$(this).siblings().removeClass('active');
				$(this).addClass('active');

				if ($(this).hasClass('manual')) {
					amount = $(this).children('input').val();
					$(this).children('input')[0].focus();
				} else {
					amount = $(this).text();
				}

				if (isCurrentAmountValid(amount)) root.removeClass('paypal-amount-error');
			});

			root.find('.amount span input').on('input', function() {
				amount = $(this).val();

				if (isCurrentAmountValid(amount)) root.removeClass('paypal-amount-error');
			});

			root.find('.interval span').on('click', function() {
				if (!root.hasClass('interval-selected')) {
					let amountEl = root.find('.amount');
					let heightBefore = amountEl.outerHeight();
					root.addClass('interval-selected');
					let heightAfter = amountEl.outerHeight();
					amountEl.css('height', heightBefore).animate({
						height: heightAfter + 'px'
					}, 200, () => amountEl.css('height', ''));
				}

				let t = $(this).text().toLowerCase();

				fillAmountsByInterval(root, t.toLowerCase());

				// Remove selected amount if NOT manual
				if (!root.find('.amount span.active').hasClass('manual')) {
					root.find('.amount span').removeClass('active');
					root.find('.amount span.manual input').val('');
					amount = undefined;
				}

				$(this).siblings().removeClass('active');
				$(this).addClass('active');

				// Clear previous interval and amount inputs
				form.find('input[name=p3], input[name=t3], input[name=a3]').remove();

				if (t === 'once') {
					formElements.interval.monthly.remove();
					formElements.interval.yearly.remove();
					formElements.amount.subscription.remove();
					form.prepend(formElements.amount.once);
					inputCmd.val(intervalModes.once);
				} else {
					formElements.amount.once.remove();
					form.prepend(formElements.amount.subscription);

					if (t === 'monthly') {
						formElements.interval.yearly.remove();
						form.prepend(formElements.interval.monthly);
					} else if (t === 'yearly') {
						formElements.interval.monthly.remove();
						form.prepend(formElements.interval.yearly);
					}

					inputCmd.val(intervalModes.subscription);
				}

				root.removeClass('paypal-interval-error');
			});

			form.on('submit', function() {
				if (!inputCmd.val()) {
					root.addClass('paypal-interval-error');
					return false;
				}

				if (isCurrentAmountValid(amount) == false) {
					root.addClass('paypal-amount-error');
					return false;
				}

				if (inputCmd.val() === intervalModes.subscription) {
					let subscriptionAmount = Number.parseFloat(amount).toFixed(2);
					console.log("Subscription amount set:", subscriptionAmount);
					form.children('input[name=a3]').val(subscriptionAmount);
					console.log("Subscription amount ok.");
				} else {
					form.children('input[name=amount]').val(Number.parseFloat(amount).toFixed(2));
				}

				// Debug output before setting the form input values
				console.log("Form Submission Details:");
				console.log("Amount before parsing: " + amount);
				console.log("Parsed amount: " + Number.parseFloat(amount).toFixed(2));
				$(this).find('input').each(function() {
					console.log($(this).attr('name') + ': ' + $(this).val());
				});

				var formData = $(this).serialize();
				console.log("Form Data: ", formData);
				console.log("Submission URL: ", this.action + "?" + formData);

				return true;
			});

			// 6. Finalize Setup

			fillAmountsByInterval(root, 'once');
			root.find('.amount .error .min').text(standards.minimumDollars);

			root.addClass('js-fully-loaded');
			root.animate({
				opacity: 1
			});
		});

	};

	// 4. Auto-Initialization

	$('.pay-via-paypal-module').payViaPaypal('init');

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['PayViaPaypal.js'] = true;


}





/* === Download_Button.js ================================================== */





if( mwDev.data.log.jsload['Download_Button.js'] !== false ) {

/*
Enrich Download_Button (from Widget) in the DOM with functionality
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is just an augmentation
*/

(function () {

	// Events

	$('.download-button-v2').each( function() {
		if($(this).attr('data-redirect')) {
			let redirect = $(this).attr('data-redirect').split(',');
			$(this).on( 'click', function() {
				setTimeout( function() {
					window.location = redirect[0];
				}, parseInt( redirect[1] ) );
			});
		}
	});

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['Download_Button.js'] = true;


}





/* === ExpandAndCollapse.js ================================================== */





if( mwDev.data.log.jsload['ExpandAndCollapse.js'] !== false ) {

/*
Make an element with the give class into a button that triggers all expand buttons to either close or open
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is just an augmentation
*/

(function() {

	let allExpanded = false;

	// Setup

	$('.expand-or-collapse-all-button').on('click', function() {
		$('.mw-collapsible-text').each( function() {
			if( allExpanded && $(this).parent().hasClass('mw-collapsible-toggle-expanded')
				|| ! allExpanded && $(this).parent().hasClass('mw-collapsible-toggle-collapsed') ) {
				$(this)[0].click();
			}
		});

		$(this).toggleClass('all-expanded');
		allExpanded = ! allExpanded;
	});

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['ExpandAndCollapse.js'] = true;


}





/* === WikitableAutoWrapper.js ================================================== */





if( mwDev.data.log.jsload['WikitableAutoWrapper.js'] !== false ) {

/*
Auto-wraps ".wikitable" elements in a wrapper with helper elements to guarantee 100% width and indicate scrollability
See detailed documentation in Dev/mediawiki
deferrable:YES -- The user will not need (or see) this info immediately anyways
*/

(function () {

	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

	$('table.wikitable').each( function() {
		let table = $(this);
		let wrapper = $('<div class="wikitable-auto-wrapper"><div class="before"></div><div class="table-content"></div><div class="after"></div>');

		let originalTableHeight = table.height();

		function enrich() {
			wrapper.css( {
				height: originalTableHeight,
				margin: window.getComputedStyle( table[0] ).getPropertyValue('margin'),
			});

			let tableContentDiv = wrapper.find('.table-content');
			wrapper.insertBefore( table );
			tableContentDiv.append( table );

			if( isMobile && tableContentDiv.width() < tableContentDiv.prop('scrollWidth') ) {
				wrapper.addClass('scroll-overflow-mobile');
				wrapper.css( 'top', - wrapper.children('.before').height() );
			}
		}

		// Normal case
		if( originalTableHeight > 0 ) {
			enrich();
		}
		// In cases where the table is hidden, for example in mw-collapsible
		else {
			if( IntersectionObserver ) {
				new IntersectionObserver((entries, observer) => {
					entries.forEach(entry => {
						if(entry.intersectionRatio > 0) {
							originalTableHeight = table.height();
							enrich();
							// So it just happens once
							observer.disconnect();
						}
					});
				}).observe(table[0]);
			}
		}
	});

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['WikitableAutoWrapper.js'] = true;


}





/* === FlyInNotification.js ================================================== */





if( mwDev.data.log.jsload['FlyInNotification.js'] !== false ) {

/*
Widget: FlyInNotificaton - JS Initialisation, Setup, Events
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is basically a standalone gadget
*/

(function() {

	// Settings

	let waitInSeconds = 120; // integer
	let cookieDays = 7; // Life span of dismiss cookie, after that notification will be shown again
	let cookieName = 'flyInBannerIdDismissed';

	// Only for testing purposes on /wiki/TestpageForFlyInNotification

	let isTestpage = $('body').hasClass('page-TestpageForFlyInNotification')

	if( isTestpage ) {
		let altData = (varname,originalValue) => $('.fly-in-notification-data').attr("data-"+varname.toLowerCase()) || originalValue;
		waitInSeconds = parseInt( altData( 'waitInSeconds', waitInSeconds ) );
		cookieDays = parseInt( altData( 'cookieDays', cookieDays ) );
		cookieName = altData( 'cookieName', cookieName );
	}

	// Globals

	let panel = $('#fly-in-notification-panel');

	// Setup

	// If notification is disabled, stop here
	if( Cookies.get( cookieName ) && ! isTestpage ) return;

	setTimeout( function() {
		panel.css( 'display', 'block' );
		let w = panel.width();
		panel.find( '.inner-wrapper' ).css( 'width', w + 'px' );
		panel.css( 'width', 0 ).animate({ width: w }, () => panel.css( 'width', '' ));
	}, waitInSeconds * 1000 );

	// Events

	panel.find('.close-panel').on( 'click', function() {
		Cookies.set( cookieName, true, { expires: cookieDays, sameSite: 'strict' } );
		panel.animate( { width: 0 }, () => panel.css( { display: 'none', width: '' } ) );
	});

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['FlyInNotification.js'] = true;


}





/* === TocLevelSwitcher.js ================================================== */





if( mwDev.data.log.jsload['TocLevelSwitcher.js'] !== false ) {

/*
TOC Switcher Gadget - JS Initialisation, Setup, Events
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is just an augmentation
*/

(function() {

	if( $('#toc').length ) {

		let cookieName = 'ctbc_tocLevelSet';

		// If there's no level 2, TocLevelSwitcher can do nothing
		if( $('.toclevel-2').length == 0 ) return;

		// Setup

		let panel = $(''
			+ '<div id="toc-level-switcher">'
			+  '<span data-level="all" title="Show all levels"><i class="fas fa-star"></i></span>'
			// If there's no level 3, then button "Show 2 levels" can do nothing
			+  ( $('.toclevel-3').length == 0 ? '' : '<span data-level="two" title="Show 2 levels">2</span>' )
			+  '<span data-level="one" title="Show 1 level">1</span>'
			+ '</div>'
		);

		if( $('#toc .toctogglecheckbox').length ) {
			panel.insertAfter( $('#toc .toctogglecheckbox') );
		} else {
			$('#toc').prepend( panel );
		}

		$('#toc').addClass( 'toc-level-switcher-enhanced' );

		let opener = $( '<span class="toc-level-switcher-opener"><i class="fas fa-plus"></i></span>' );

		let counter = $( '<span class="toc-level-switcher-counter">(<span class="count"></span>)</span>' );

		// Events

		$('#toc-level-switcher > span').on( 'click', function() {
			$(this).siblings().removeClass('active');
			$(this).addClass('active');

			let highestLevel = $(this).attr('data-level');

			$('body').removeClass( cookieName + '_' + Cookies.get( cookieName ) );
			if( highestLevel == 'all' ) {
				Cookies.remove( cookieName );
			} else {
				Cookies.set( cookieName, highestLevel, { sameSite: 'strict' } );
				$( 'body' ).addClass( cookieName + '_' + highestLevel );
			}

			if( highestLevel == 'all' ) {
				$('#toc').removeAttr('data-level');
			} else {
				$('#toc').attr('data-level', highestLevel );
			}

			$('.toc-level-switcher-opener').remove();
			$('.toc-level-switcher-counter').remove();

			$('.toclevel-1, .toclevel-2').removeClass('toc-level-switcher-show');

			let enrichLevel = function() {
				let $this = $(this);

				let nextLevel = $this.hasClass('toclevel-1') ? '.toclevel-2' : '.toclevel-3';
				let count = $this.find( nextLevel ).length;

				if( count == 0 ) return;

				let c = counter.clone();
				c.find('.count').text( count );
				$this.find('.toctext').eq(0).append( c );

				let o = opener.clone();
				$this.prepend( o );

				// Events

				o.on( 'click', function() {
					$this.addClass('toc-level-switcher-show');
					o.remove();
				});
			};

			switch( highestLevel ) {
				case 'one':
					$('.toclevel-1').each( enrichLevel );
					$('.toclevel-2').each( enrichLevel );
				break;
				case 'two':
					$('.toclevel-2').each( enrichLevel );
				break;
			}

		});

		// Execute at startup

		let cookieValue = Cookies.get( cookieName );
		if( cookieValue ) $( `#toc-level-switcher > span[data-level=${ cookieValue }]` )[0].click();

	}

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['TocLevelSwitcher.js'] = true;


}





/* === EditorFullscreen.js ================================================== */





if( mwDev.data.log.jsload['EditorFullscreen.js'] !== false ) {

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

mwDev.data.log.jsload['EditorFullscreen.js'] = true;


}





/* === EditorAutoBackup.js ================================================== */





if( mwDev.data.log.jsload['EditorAutoBackup.js'] !== false ) {

/*
EditorAutoBackup Gadget - CSS styling. The editor can now save a backup of the last save to localStorage
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is just an augmentation
*/

(function () {

	if( $('#editform').length ) setTimeout( function() {

		let allowSubmit = false;

		// Setup

		var editor;
		if( $('#editform .ace_editor' ).length ) {
			$('#editform .ace_editor' ).attr('id','editform-ace-editor');
			editor = ace.edit('editform-ace-editor');
		}

		$('#wikiEditor-ui-toolbar').append($( '<i class="editor-auto-backup far fa-save"></i>' ));

		let modal = $( ''
			+ '<div class="mini-modal" id="editorAutoBackupModal">'
			+ ' <div class="info">Your latest AutoBackup</div>'
			+ ' <div class="title"></div>'
			+ ' <div class="date"></div>'
			+  '<textarea></textarea>'
			+ '</div>'
		);

		$('body').append(modal);

		// Events

		function saveBackup( alwaysPlain ) {
			let content = editor && !alwaysPlain ? ace.edit('ace_editor').getValue() : $('#wpTextbox1').val();
			localStorage.setItem('wikiEditorAutoBackup', JSON.stringify({
				content: content,
				date: (new Date()).toLocaleString(),
				title: $('#firstHeading').text(),
			}));
		}

		$('.save-and-continue').on( 'click', saveBackup );

		$('#editform').on( 'submit', function(e) {
			if( allowSubmit ) return true;

			e.preventDefault();

			let submitter = document.activeElement;

			saveBackup( true );

			setTimeout( function() {
				allowSubmit = true;
				$('#editform')[0].requestSubmit( submitter );
			}, 100 );

			return false;
		});

		$('#wikiEditor-ui-toolbar .editor-auto-backup').on( 'click', function() {
			let data = JSON.parse( localStorage.getItem('wikiEditorAutoBackup') );
			modal.find('.title').text(data.title);
			modal.find('.date').text(data.date);
			modal.find('textarea').val(data.content);
			$('#editorAutoBackupModal').miniModal('show');
		});

	}, 500 );

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['EditorAutoBackup.js'] = true;


}





/* === EditorMultiwikiNotice.js ================================================== */





if( mwDev.data.log.jsload['EditorMultiwikiNotice.js'] !== false ) {

/*
EditorMultiwikiNotice Gadget - JS Initialisation, Setup, Events. The editor now shows if this is a multiwiki master / slave page
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is just an augmentation
*/

(function() {

	let masterWikiDomain = {
		clearnet: 'www.kicksecure.com',
		onion: 'www.w5j6stm77zs6652pgsij4awcjeel3eco7kvipheu6mtr623eyyehj4yd.onion',
	};

	let urlParts = {
		protocol: { clearnet: 'https://', onion: 'http://', },
		info: '/wiki/Dev/mediawiki#MultiWiki',
		edit: '/w/index.php?action=edit&title=',
	};

	// Only active if a page gets edited and if the page is MultiWiki
	if( (new URLSearchParams( window.location.search )).get('action') != 'edit'
		|| ! $('#wpTextbox1').val().match(/\[\[\s*Category\s*:\s*MultiWiki\s*\]\]/) )
		return;

	let domain = (new URL( window.location.href )).hostname;
	let domainType = domain.match(/\.onion$/) ? 'onion' : 'clearnet';

	let multiWikiInfo = $( ''
		+ '<ul class="editor-multi-wiki-notice icon-bullet-list minimal">'
		+ ( domain == masterWikiDomain[domainType]
			? '<li>'
				+' <i class="fas fa-exclamation cs-yellow"></i>'
				+ '<span><b>Beware, you are editing a MultiWiki master page!</b> Your edits will take effect on all slave wikis too.</span>'
			+ ' </li>'
			+ '<li>'
				+ '<i class="fas fa-info cs-blue"></i>'
				+ '<span>Read here <a class="multiwiki-info" target="_blank">how MultiWiki works</a>.</span>'
			+ '</li>'

			: '<li><i class="fas fa-times cs-red"></i><span><b>Please do not edit!</b> This is a MultiWiki slave page.</span></li>'
			+ '<li>'
				+ '<i class="fas fa-info cs-blue"></i>'
				+ '<span>Read here <a class="multiwiki-info" target="_blank">how and where you should edit</a> instead.</span>'
			+ '</li>'
			+  '<li>'
				+ '<i class="fas fa-pen cs-green"></i>'
				+ '<span>Or <a class="multiwiki-edit-master" target="_blank">edit the master page here</a>.</span>'
			+ '</li>'
		)
		+ '</ul>'
	);

	$('#mw-content-text').prepend( multiWikiInfo );

	multiWikiInfo.find('.multiwiki-info').attr( 'href', urlParts.protocol[domainType] + masterWikiDomain[domainType] + urlParts.info );
	multiWikiInfo.find('.multiwiki-edit-master').attr( 'href', urlParts.protocol[domainType] + masterWikiDomain[domainType]
		+ urlParts.edit + (new URLSearchParams( window.location.search )).get('title') );

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['EditorMultiwikiNotice.js'] = true;


}





/* === StageServerNotice.js ================================================== */





if( mwDev.data.log.jsload['StageServerNotice.js'] !== false ) {

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

mwDev.data.log.jsload['StageServerNotice.js'] = true;


}





/* === Footer.js ================================================== */





if( mwDev.data.log.jsload['Footer.js'] !== false ) {

/*
JS functionality for our custom footer
See detailed documentation in Dev/mediawiki
deferrable:YES -- This add functionality, but is independent
*/

(function() {

	if( $('#custom-footer').length == 0 ) return;

	// Setup

	let fmodal = $('#footer-show-qr-codes-modal');
	let initComplete = false;

	// Events

	$('#custom-footer .donate a:not(.donate-button)').on('click', function( e ) {
		e.preventDefault();

		if( ! initComplete ) {
			$('<img width="300" height="300">').insertAfter('#footer-show-qr-codes-modal .qr-area h5');
			initComplete = true;
		}

		fmodal.find('h5').text( $(this).attr('title') );
		fmodal.find('img').attr( 'src', $(this).children('img').attr('src') );
		fmodal.find('.code-select .code').text( $(this).attr('data-address') );
		fmodal.miniModal('show');
	});
})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['Footer.js'] = true;


}





/* === Sitenotice.js ================================================== */





if( mwDev.data.log.jsload['Sitenotice.js'] !== false ) {

/*
JS enhancements, events etc for Widget:Sitenotice
See detailed documentation in Dev/mediawiki
*/

(function () {


	// =============================
	// A : All Banners Functionality


	// -----
	// Setup

	// Check if there is an active banner that is not blocked by the user, if so append Close-Button

	if( $('#siteNotice .banner').length > 0 ) {
		$('#siteNotice .sitenotice-body').prepend( $( `
			<div class="sitenotice-close" title="Hide this notice for me">
				<img src="/w/images/thumb/0/0b/End-of-year-times.png/28px-End-of-year-times.png" with="14" height="14" alt="close" />
			</div>
		`));
		$('#siteNotice .sitenotice-body .sitenotice-close').hide().fadeIn();
	}

	// ------
	// Events

	$('#siteNotice .sitenotice-close').on( 'click', function() {
		if( $('#siteNotice .banner').length > 0 ) {
			Cookies.set( 'ctbc_hide-sitenotice-' + $('#siteNotice .sitenotice-body').attr( 'data-sitenotice-id' ), 'true', { expires: 30, sameSite: 'strict' } );
			$('#siteNotice').hide();
		}
	});


	// ================================
	// B : Custom Banners Functionality


})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['Sitenotice.js'] = true;


}





/* === CodeSelectHighlightList.js ================================================== */





if( mwDev.data.log.jsload['CodeSelectHighlightList.js'] !== false ) {

/*
Data for CodeSelect Gadget - additional function names for the highlighting of bash language in CodeSelect highlighting
See detailed documentation in Dev/mediawiki
deferrable:NO -- Because other scripts are dependent on it
*/

(function() {

	mwDev.data.app.codeSelectHighlightBashAdditionalFunctionNames = [];

	// This list has been manually written.
	mwDev.data.app.codeSelectHighlightBashAdditionalFunctionNames.push(
		'readpe',
		'diffoscope',
		'vbindiff',
		'diff',
		'iotop',
		'top',
		'htop',
		'pe-header-to-zero',
		'osslsigncode',
		'flatpak',
		'torsocks',
		'systemctl',
		'systemd-detect-virt',
		'systemd-nspawn',
		'qubes-dom0-update',
		'scour',
		'mat2',
		'optipng',
		'jpegoptim',
		'cwebp',
		'zerofree',
		'aspell',
		'parted',
		'gparted',
		'qemu-img',
		'qemu-info',
		'qemu',
		'VBoxManage',
		'lxsudo',
		'aspell',
		'xl',
		'gpg',
		'dpkg',
		'dpkg-reconfigure',
		'sudoedit',
		'signify-openbsd',
		'mousepad',
		'adduser',
		'sha256sum',
		'sha512sum',
		'qvm-appmenus',
		'qvm-console-dispvm',
		'qvm-firewall',
		'qvm-move-to-vm',
		'qvm-remove',
		'qvm-start-gui',
		'qvm-template-postprocess',
		'qvm-backup',
		'qvm-copy',
		'qvm-get-image',
		'qvm-pause',
		'qvm-run',
		'qvm-sync-appmenus',
		'qvm-unpause',
		'qvm-backup-restore',
		'qvm-copy-to-vm',
		'qvm-get-tinted-image',
		'qvm-pci',
		'qvm-service',
		'qvm-sync-clock',
		'qvm-usb',
		'qvm-block',
		'qvm-create',
		'qvm-kill',
		'qvm-pool',
		'qvm-shutdown',
		'qvm-tags',
		'qvm-volume',
		'qvm-check',
		'qvm-device',
		'qvm-ls',
		'qvm-pool-legacy',
		'qvm-start',
		'qvm-template',
		'qvm-xkill',
		'qvm-clone',
		'qvm-features',
		'qvm-move',
		'qvm-prefs',
		'qvm-start-daemon',
		'qvm-template-gui',
		'qvm-appmenus',
		'qvm-console-dispvm',
		'qvm-firewall',
		'qvm-move-to-vm',
		'qvm-remove',
		'qvm-start-gui',
		'qvm-template-postprocess',
		'qvm-backup',
		'qvm-copy',
		'qvm-get-image',
		'qvm-pause',
		'qvm-run',
		'qvm-sync-appmenus',
		'qvm-unpause',
		'qvm-backup-restore',
		'qvm-copy-to-vm',
		'qvm-get-tinted-image',
		'qvm-pci',
		'qvm-service',
		'qvm-sync-clock',
		'qvm-usb',
		'qvm-block',
		'qvm-create',
		'qvm-kill',
		'qvm-pool',
		'qvm-shutdown',
		'qvm-tags',
		'qvm-volume',
		'qvm-check',
		'qvm-device',
		'qvm-ls',
		'qvm-pool-legacy',
		'qvm-start',
		'qvm-template',
		'qvm-xkill',
		'qvm-clone',
		'qvm-features',
		'qvm-move',
		'qvm-prefs',
		'qvm-start-daemon',
		'qvm-template-gui',
		'qubes-app-menu',
		'qubes-create',
		'qubes-guid',
		'qubes-input-trigger',
		'qubes-policy-admin',
		'qubes-qube-manager',
		'qubes-vm-clone',
		'qubes-backup',
		'qubes-dom0-update',
		'qubes-guivm-session',
		'qubes-log-viewer',
		'qubes-policy-editor',
		'qubes-template-manager',
		'qubes-vm-create',
		'qubes-backup-restore',
		'qubes-fwupdmgr',
		'qubes-hcl-report',
		'qubes-new-qube',
		'qubes-prefs',
		'qubes-prepare-vm-kernel',
		'qubes-update-gui',
		'qubes-vm-settings',
		'qubes-bug-report',
		'qubes-global-config',
		'qubes-input-sender',
		'qubes-policy',
		'qubes-vm-boot-from-device',
		'qubes-vm-update',
	);

	// This list has been auto generated using: dm-code-select-highlight-list-generate
	mwDev.data.app.codeSelectHighlightBashAdditionalFunctionNames.push(
		'add-calamares-desktop-icon.dist',
		'anon-auth-autogen',
		'anon-connection-wizard',
		'anon-consensus-del',
		'anon-consensus-del-files',
		'anondate',
		'anondate-get',
		'anondate-set',
		'anondate-tester',
		'anon-gw-leaktest',
		'anon-info',
		'anon-log',
		'anon-server-to-client-install',
		'anon-verify',
		'apparmor-info',
		'apparmor-watch',
		'apt.anondist',
		'apt-cacher-ng-prepare',
		'apt-cacher-ng-undo',
		'apt-file.anondist',
		'apt-get.anondist',
		'apt-get-noninteractive',
		'apt-get-reset',
		'apt-get-update-plus',
		'aptitude-curses.anondist',
		'apt-key-install',
		'clock-random-manual-cli',
		'clock-random-manual-gui',
		'corridor-data',
		'corridor-init-forwarding',
		'corridor-init-logged',
		'corridor-init-snat',
		'corridor-load-config',
		'corridor-load-ipset',
		'corridor-load-ipset-logged',
		'corridor-load-ipset-relays',
		'corridor-stop-forwarding',
		'corridor-stop-snat',
		'curl.anondist',
		'curl-download',
		'damngpl',
		'dev-adrelanos',
		'dist-info',
		'dm-apt-get-wrapper-test',
		'dm-check-mirrors',
		'dm-check-unicode',
		'dm-code-select-highlight-list-generate',
		'dm-debug-diff-repo',
		'dm-debug-whonix-test-changes',
		'dm-git-tag-checkout-latest',
		'dm-install-from-local-repository',
		'dm-interactive-chroot-raw',
		'dm-list-all-source-files',
		'dm-list-all-usr-bin-sbin',
		'dm-migrate-to-proposed-updates-repository',
		'dm-migrate-to-stable-repository',
		'dm-migrate-to-testers-repository',
		'dm-mount-vdi',
		'dm-packaging-helper-script',
		'dm-paypal-wiki-templates-create',
		'dm-prepare-release',
		'dm-proof-of-freshness-generator',
		'dm-qubes-repo-temp',
		'dm-qubes-templates-official-build-commands',
		'dm-replace-list',
		'dm-reprepro-wrapper',
		'dm-resign-canary',
		'dm-resign-repository',
		'dm-rsync-test',
		'dm-shellcheck-wrapper',
		'dm-source-tarball-create',
		'dm-travis-deprecated',
		'dm-unmount-vdi',
		'dm-unmount-vdi-force',
		'dm-upgrade-from-local-repository',
		'dm-upload-canary',
		'dm-upload-images',
		'dm-upload-installer-dist',
		'dm-upload-repository',
		'dm-virtualbox-test-vm',
		'dnf-3.anondist',
		'dpkg-noninteractive',
		'dsudo',
		'easo',
		'easyorca-root',
		'genmkfile',
		'git.anondist',
		'gpg2.anondist',
		'gpg.anondist',
		'gpg-dearmor',
		'gpl_download_sources',
		'grep-find-unicode-wrapper',
		'gsudoedit',
		'hardened-malloc-enabled-test',
		'hardened-malloc-type-test',
		'hexchat-reset',
		'i2pbrowser',
		'ia-save',
		'initramfs-debug-enable',
		'initrd-file-detect',
		'installer-dist',
		'install-host',
		'iptables-save-deterministic',
		'ip_unpriv',
		'kernel-file-detect',
		'kicksecure',
		'kicksecure-disclaimer',
		'kicksecure-license',
		'ld-system-preload-disable',
		'leaktest',
		'limit-low',
		'limit-medium',
		'minimum-time-check',
		'minimum-unixtime-show',
		'mixmaster-update.anondist',
		'monero-blockchain-ancestry',
		'monero-blockchain-depth',
		'monero-blockchain-export',
		'monero-blockchain-import',
		'monero-blockchain-mark-spent-outputs',
		'monero-blockchain-prune',
		'monero-blockchain-prune-known-spent-data',
		'monero-blockchain-stats',
		'monero-blockchain-usage',
		'monerod',
		'monero-gen-ssl-cert',
		'monero-gen-trusted-multisig',
		'monero-wallet-cli',
		'monero-wallet-gui',
		'monero-wallet-gui.AppImage',
		'monero-wallet-rpc',
		'mw-all-pages',
		'mw-copy-wiki-file',
		'mw-copy-wiki-pages',
		'mw-edit',
		'mw-fetch',
		'mw-file-download',
		'mw-file-to-url',
		'mw-file-to-web-archive',
		'mw-file-to-weblinks',
		'mw-file-upload',
		'mw-flagged-revisions-approve-all',
		'mw-flagged-revisions-approve-page',
		'mw-folder-to-weblinks',
		'mw-login',
		'mw-logout',
		'mw-multi-wiki',
		'mw-process-all-pages',
		'mw-specific-backup-kicksecure',
		'mw-specific-backup-whonix',
		'mw-wiki-fetch-backup',
		'mw-wiki-link-clean',
		'mw-wiki-login-test',
		'mw-wiki-restore-backup',
		'mw-wiki-to-weblinks',
		'networking-aae',
		'onion-grater-add',
		'onion-grater-list',
		'onion-grater-remove',
		'onionshare.anondist',
		'onionshare-gui.anondist',
		'onion-time-pre-script',
		'orca-enable-autostart',
		'pkexec.security-misc',
		'pwchange',
		'qubes-remote-support-provider',
		'qvm-sync-clock.anondist',
		'rapt',
		'rawdog.anondist',
		'release-upgrade',
		'repo-add-dist',
		'repository-dist',
		'repository-dist-wizard',
		'restart-tor-gui',
		'ricochet.anondist',
		'sandbox-app-launcher',
		'scurl',
		'scurl-download',
		'sdwdate',
		'sdwdate-clock-jump',
		'sdwdate-gui',
		'sdwdate-gui-qubes',
		'sdwdate-log-viewer',
		'segfault-build',
		'setup-dist',
		'setup-dist-noninteractive',
		'setup-wizard-dist',
		'ssh.anondist',
		'str_replace',
		'systemcheck',
		'time_privacy',
		'timesanitycheck',
		'tor.anondist',
		'tor.anondist',
		'torbrowser',
		'tor-circuit-established-check',
		'tor-control-panel',
		'tor-ctrl',
		'tor-ctrl-circuit',
		'tor-ctrl-observer',
		'tor-ctrl-onion',
		'tor-ctrl-stream',
		'update-i2pbrowser',
		'update-torbrowser',
		'upgrade-nonroot',
		'url_to_unixtime',
		'uwt_settings_show',
		'vbox-guest-installer',
		'virtualbox-send-sysrq',
		'wget.anondist',
		'whichbrowser',
		'whonix',
		'whonix-dev-backup',
		'whonix-disclaimer',
		'whonix_firewall',
		'whonix-gateway-firewall',
		'whonix-host-firewall',
		'whonix-license',
		'whonix-workstation-firewall',
		'wipe-ram-shutdown-helper',
		'wormhole.anondist',
		'xchat-reset',
		'yum.anondist',
		'yumdownloader.anondist',
  );

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['CodeSelectHighlightList.js'] = true;


}





/* === HashController.js ================================================== */





if( mwDev.data.log.jsload['HashController.js'] !== false ) {

/*
Hash Control library - register every hash dependent function
See detailed documentation in Dev/mediawiki
deferrable:NO -- Because a other scripts are dependent on it
*/

(function() {

	let allHashCallbacks = {};
	let emptyHashCallbacks = [];

	let isInitialTriggerRequested = false;

	// HELPER

	// Getting the decoded hash
	let get = () => decodeURIComponent( window.location.hash.substring(1) );

	// Triggering the selected hash function
	let triggerFn = () => {
		let hash = get();
		if( hash && allHashCallbacks[ hash ] ) allHashCallbacks[ hash ]();
		if( ! hash ) emptyHashCallbacks.forEach( element => element() );
	};

	// Register with our dev tools

	mwDev.tools.hashControl = {
		// Register a callback-function with an id/hash
		register: function( id, callback, requestInitialTrigger ) {
			if( id ) allHashCallbacks[ id ] = callback;
			else emptyHashCallbacks.push( callback );

			if( requestInitialTrigger ) isInitialTriggerRequested = true;
		},
		// Simulate a popstate event (useful for example if initial Hash should be handled)
		trigger : function( initial ) {
			if( initial != 'initial' || isInitialTriggerRequested ) triggerFn();
		},
		// Get current Hash
		get: get,
		// Set the hash (affects registered function)
		set: function( hash ) {
			let urlObj = new URL(window.location);
			if( hash != urlObj.hash.substring(1) ) window.history.pushState( { info: 'js pushState' }, '[Param deprecated]', mwDev.data.app.baseUrl + '?' + urlObj.searchParams.toString() + ( hash ? '#' + hash : '' ) );
		},
	};

	// Event : Handle Event popstate centrally

	$(window).on( 'popstate', triggerFn );

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['HashController.js'] = true;


}





/* === MiniModal.js ================================================== */





if( mwDev.data.log.jsload['MiniModal.js'] !== false ) {

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

mwDev.data.log.jsload['MiniModal.js'] = true;


}





/* === TabContentController.js ================================================== */





if( mwDev.data.log.jsload['TabContentController.js'] !== false ) {

/*
TabContentController Gadget - JS Initialisation, Setup, Events
See detailed documentation in Dev/mediawiki
deferrable:YES -- This is a standalone gadget / augmentation
*/

/* See Dev/mediawiki for documentation */

/*
Important definitions for Devs
------------------------------
controller = container where the navigation and the content-container
navigaton = the mininav container for the tab item list
tabContainer = the li element housing the tab
tab = the link element to navigate to the corresponding content item
sectionList = the collection of the actual content (section) for each tab
section = the actual content for an individual tab
content = meta concept meaning both section and the corresponding tab
*/

(function() {

	let doScroll = true;

	function chooseTab( contentId ) {
		let selector = `[data-tcc-contentId="${contentId}"]`;
		$( '.tcc-tab' + selector ).parent().siblings().children().removeClass('active');
		$( '.tcc-section' + selector ).siblings().removeClass('active');
		$( selector + ':not(.is-link)' ).addClass('active');
	}

	// ---------------------------------------
	// jQuery extension : tabContentController

	$.fn.tabContentController = function(action) {

		// Only allow 'init' or 'select' at the moment (extendable later)
		if( action != 'init' && action != 'select' ) return;

		/* SELECT */

		if( action == 'select' ) {
			let collection = $(this).filter('.tcc-tab, .tcc-section');
			collection.each( ( index, elem ) => chooseTab( $(elem).attr('data-tcc-contentid') ) );
			return;
		}

		/* INIT */

		// Traversing over the given collection

		let collection = $(this).filter('.tab-content-controller');

		collection.each( function() {

			// Prevent double initialization
			if( $(this).hasClass('js-fully-loaded') ) return;

			// Setup

			// For linked Controllers : ID of the tab controller group
			let tcLinkedGroupId = $(this).attr( 'data-tcc-linkid' );
			// If no link id then "group" is just this controller
			let tcLinkedGroup = tcLinkedGroupId ? collection.filter( (index,element) => $(element).attr( 'data-tcc-linkid' ) == tcLinkedGroupId ) : $(this);

			tcLinkedGroup.each( function() {

				// Apply dark feature via tcc-dark class
				if( $(this).hasClass('tcc-dark') ) $(this).find('> .mininav').addClass('mn-dark');

				$(this).find('> .mininav').append('<ul></ul>')
				let tabList = $(this).find('.mininav > ul');

				$(this).find('> .tcc-content > .tcc-section').each( function( index, element ) {

					let section = $(this);
					let sectionHeadlineId = section.find('.tcc-title .mw-headline').attr('id');

					// Create tab. All are links but disabled. If only link given in section then create direct link-tab (with .is-link class)
					let tabContainer = $( `<li><a href="${ window.location.href.split('#')[0] + '#' + sectionHeadlineId }"></a></li>` );
					// If the section's content has exactly 1 child, that is a p, and that p has 1 child (and no text nodes) that is an a. Whitespaces are trimmed for caparison
					if( section.find('> .tcc-content > p > a').length == 1 && section.find('> .tcc-content > p').text().trim() == section.find('> .tcc-content > p > a').text() ) {
						tabContainer = $( `<li><a class="is-link" href="${section.find('> .tcc-content > p > a').attr('href')}"></a></li>` );
						section.addClass('is-link');
					}
					let tab = tabContainer.children().first();

					tab.addClass( 'tcc-tab' );
					tab.text( section.find('> .tcc-title .mw-headline').text() );
					if( section.hasClass('active') ) tab.addClass('active');
					if( section.find('> .tcc-image img').length > 0 ) tab.prepend( section.find('> .tcc-image img') );

					// Creating or fetching contentId (from linked Controller) and applying it to tab and section
					let contentId = 'id-' + Math.random().toString().substr(2);
					let existingContent = $(`[data-tcc-linkid="${tcLinkedGroupId}"].js-fully-loaded`);
					if( existingContent.length > 0 ) contentId = existingContent.eq(0).find('> .tcc-content > .tcc-section').eq( index ).attr('data-tcc-contentId');
					tab.attr( 'data-tcc-contentId', contentId );
					section.attr( 'data-tcc-contentId', contentId );

					tabList.append( tabContainer );

					// Event : Click Tab
					if( ! tab.hasClass('is-link') ) tabContainer.on( 'click', () => { doScroll = false; });

					// Register Tab Controller with Hash Controller

					mwDev.tools.hashControl.register( sectionHeadlineId, function() {
						let selectedHeadline = $( `.tab-content-controller .tcc-title .mw-headline[id="${mwDev.tools.hashControl.get()}"]` );
						// If section with hash as headline ID is found open this section/tab and all parent sections/tabs
						if( selectedHeadline.length > 0 ) {
							selectedHeadline.parents('.tcc-section').each( function() {
								chooseTab( $(this).attr('data-tcc-contentid') );
							});
							// And scroll to the position of the direct content controller parent in the document
							if( doScroll ) {
								$('html, body').animate( { scrollTop: selectedHeadline.parents('.tab-content-controller')[0].getBoundingClientRect().top + window.pageYOffset - 70  }, 500 );
								doScroll = true;
							}
						}
					}, true );

				});

				// If no element is active make the first one active that is not a link
				if( ! $(this).find('.tcc-section').hasClass('active') ) {
					chooseTab( tabList.find('a:not(.is-link)').eq(0).attr('data-tcc-contentId') );
				}

				$(this).addClass('js-fully-loaded');
			});

		});

	}

	// -------------------
	// Page Initialization

	// Automatic initialization for all tab controllers
	$('.tab-content-controller').tabContentController('init');

	// Event : Click TOC
	if( $( '#toc' ).length ) $( '#toc a' ).on( 'click', () => { doScroll = true; });

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['TabContentController.js'] = true;


}





/* === DiscoverHiddenElements.js ================================================== */





if( mwDev.data.log.jsload['DiscoverHiddenElements.js'] !== false ) {

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

mwDev.data.log.jsload['DiscoverHiddenElements.js'] = true;


}





/* === CodeSelect.js ================================================== */





if( mwDev.data.log.jsload['CodeSelect.js'] !== false ) {

/*
CodeSelect Gadget - JS Initialisation, Setup, Events. Activates all .code-select fields on the site. By clicking the icon the code is copied to clipboard and tooltip is changed
See detailed documentation in Dev/mediawiki
deferrable:NO -- Because other scripts are dependent on it
*/

(function () {

	// --------
	// Settings

	var targetPadding = 5; // only relevant for use with target. Distance from target borders right and top
	var defaultLang = 'bash'; // other option: 'none'. Or languages which are supported for highlighting (see documentation)

	// Additional function names that should also be highlighted for bash (currently outsourced to MediaWiki:CodeSelectHighlightList)
	var highlightBashAdditionalFunctionNames = window.mwDev ? window.mwDev.data.app.codeSelectHighlightBashAdditionalFunctionNames : [];

	// ------
	// Global

	var innerContent = $( `
		<i class="fa-regular fa-clone fa-rotate-90 cbutton"></i>
		<span class="tooltip2">
			<span class="hover">Click = Copy</span>
			<span class="copied">
				<i class="fa-solid fa-check"></i>
				Copied to clipboard!
			</span>
		</span>
		<span class="code"></span>
	`);

	var cbuttonIcons = { normal: 'fa-regular fa-clone fa-rotate-90', copied: 'fa-solid fa-check' };

	var highlightLangBashIsExtended = false;
	function extendHighlightLangBash() {
		if( ! highlightLangBashIsExtended ) {
			// Extend language bash with extra keywords
			let bashFnPattern = Prism.languages.bash.function.pattern;
			// We're using apt as a fixpoint, because it's very common and it's surrounded by pipes |
			let newBashFnPattern = new RegExp( bashFnPattern.source.replace( '|apt|', '|' + ['apt', ...highlightBashAdditionalFunctionNames].join('|') + '|' ), bashFnPattern.flags );
			Prism.languages.bash = Prism.languages.extend( 'bash', { 'function': { lookbehind: true, pattern: newBashFnPattern }} );
			highlightLangBashIsExtended = true;
		}
	}

	function markSelection( jqDom ) {
		let selection = window.getSelection();
		selection.removeAllRanges();

		let range = document.createRange();
		range.selectNodeContents( jqDom[0] );
		selection.addRange(range);
	}

	// ----------------
	// jQuery Extension

	$.fn.codeSelect = function( action ) {

		// Only allow 'init' at the moment (extendable later)
		if( action != 'init' ) return;

		$(this).each( function() {
			// Prevent double initialization
			if( $(this).hasClass('js-fully-loaded') ) return;

			// Setup

			const codeSelect = $(this);
			const htmlMode = codeSelect.hasClass('insert-mode-html');

			let content = codeSelect[ htmlMode ? 'html' : 'text' ]();
			codeSelect
				.empty()
				.append( innerContent.clone() )
				.find('.code')[ htmlMode ? 'html' : 'text' ]( content );

			let target = codeSelect.attr('data-target');
			if( target && $(target).length ) {
				target = $(target).eq(0);
				// If we have a target and no content (only white space) was given, copy target's content
				if( ! content.match(/\S/) ) codeSelect.find('.code').text( target.text() );
				let helper = $('<div class="code-select-target-helper"></div>');
				helper.append( codeSelect );
				// Position over target
				codeSelect.css( {
					position: 'absolute',
					top: targetPadding - target.outerHeight() - ( parseInt( target.css('marginBottom') ) || 0 ),
					right: targetPadding,
				});
				helper.insertAfter( target );

				// Fixate styles from the target to prevent content shift
				let targetStyles = window.getComputedStyle( target[0] );
				let getStyle = (name) => targetStyles.getPropertyValue(name);
				target.css( { margin: getStyle('margin'), lineHeight: getStyle('line-height'), padding: getStyle('padding'), fontSize: getStyle('font-size') } );

				if( ! codeSelect.attr('data-button-image-src' ) ) codeSelect.attr('data-button-image-src','');
			}
			else target = null;

			let imageButton = false;
			let imageSrc = codeSelect.attr('data-button-image-src');
			if( imageSrc && imageSrc.match(/\S/) ) {
				$(`<img class="cbutton" ${ codeSelect.hasClass('image-eager') ? '' : 'decoding="async" loading="lazy"' } src="${imageSrc}" />`).insertAfter( codeSelect.find('.cbutton') );
				codeSelect.find('i.cbutton').remove();
				imageButton = true;
			}

			let cbutton = codeSelect.find('.cbutton');
			let tooltip = codeSelect.find('.tooltip2');

			// Highlighting

			const lang = codeSelect.attr('data-language') || defaultLang;

			if( htmlMode || lang == 'none' ) {
				codeSelect.find('.code').addClass( 'language-none' );
			} else {
				let syntaxElement;
				// If CodeSelect is icon or imageButton no highlight for code box needed
				if( imageSrc == undefined ) {
					syntaxElement = codeSelect.find('.code')[0];
					codeSelect.find('.code').addClass( 'language-' + lang );
				}
				// If target then only highlight target
				if( target ) {
					syntaxElement = target[0];
					target.addClass( 'language-' + lang );
				}

				const highlight = function() {
					extendHighlightLangBash();
					// Execute highlight
					if( syntaxElement ) Prism.highlightElement( syntaxElement );
				};

				// Execute if dependency is ready if not do it later on event basis
				if( Prism ) highlight();
				else $('#highlight-code-script').on( 'load', highlight );
			}

			// Events

			cbutton.on('click', function() {
				// copying
				markSelection( codeSelect.find('.code') );
				document.execCommand("copy");

				// feedback and closing
				codeSelect.addClass('copied');
				if( ! imageButton ) cbutton.removeClass( cbuttonIcons.normal ).addClass( cbuttonIcons.copied );
				setTimeout(f1, 3000);
				function f1() { tooltip.fadeOut( 600, f2 ); }
				function f2() {
					codeSelect.removeClass('copied');
					if( ! imageButton ) cbutton.removeClass( cbuttonIcons.copied ).addClass( cbuttonIcons.normal );
					setTimeout( f3, 200 );
				}
				function f3() { tooltip.css( 'display', '' ); }
			});

			codeSelect.find('.code').on('click', function() {
				markSelection( $(this).parent().find('.code') );
			});

			if( target ) {
				target.on( 'click', function() {
					markSelection( target );
				});
			}

			codeSelect.addClass('js-fully-loaded');
		});
	};

	// -------------------------------------
	// Enrich selection of standard elements

	$('.code-select').codeSelect('init');

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['CodeSelect.js'] = true;


}





/* === ShareTooltip.js ================================================== */





if( mwDev.data.log.jsload['ShareTooltip.js'] !== false ) {

/*
ShareTooltip Gadget - JS Initialisation, Setup, Events. Shows a Tooltip with multiple ways to share the current page / headline
See detailed documentation in Dev/mediawiki
deferrable:NO -- Because other scripts are dependent on it
*/

(function() {


	// -----
	// Setup


	const innerDom = $( `
		<span class="robots-nocontent">
			<!--googleoff: index-->
				<!--noindex-->
					<span class="button"></span>
					<span class="menu-wrapper">
						<span class="hover-connector"></span>

						<span class="menu">
							<span class="headline"><i class="fas fa-share-nodes margin-right-5"></i> Sharing is Caring!</span>

							<span class="social" data-social="twitter" title="Share this direct link on Twitter">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="Twitter Logo" src="/w/images/thumb/6/67/Twitter-logo.png/80px-Twitter-logo.png" /></a>
							</span>
							<span class="social" data-social="facebook" title="Share this direct link on Facebook">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="Facebook Logo" src="/w/images/thumb/9/9d/Facebook-logo.png/80px-Facebook-logo.png" /></a>
							</span>
							<span class="social" data-social="telegram" title="Share this direct link on Telegram">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="Telegram Logo" src="/w/images/thumb/9/9a/1024px-Telegram_2019_Logo.svg.png/80px-1024px-Telegram_2019_Logo.svg.png" /></a>
							</span>
							<span class="social" data-social="reddit" title="Share this direct link on Reddit">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="Reddit Logo" src="/w/images/thumb/1/14/Reddit-logo.png/80px-Reddit-logo.png" /></a>
							</span>
							<span class="social" data-social="whatsapp" title="Share this direct link on WhatsApp">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="WhatsApp Logo" src="/w/images/thumb/8/8c/WhatsApp-logo.png/80px-WhatsApp-logo.png" /></a>
							</span>
							<span class="social" data-social="linkedin" title="Share this direct link on LinkedIn">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="LinkedIn Logo" src="/w/images/thumb/7/79/LinkedIn-logo.png/80px-LinkedIn-logo.png" /></a>
							</span>
							<span class="social" data-social="ycombinator" title="Share this direct link on YCombinator News">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="YCombinator Logo" src="/w/images/thumb/d/d5/Ycombinator-Logo.png/80px-Ycombinator-Logo.png" /></a>
							</span>
							<span class="social" data-social="mastodon" title="Share this direct link on Mastodon">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="Mastodon Logo" src="/w/images/thumb/b/b7/Mastodon-logo.png/80px-Mastodon-logo.png" /></a>
							</span>
							<span class="social" data-social="email" title="Share this direct link via email">
								<a href="" target="_blank"><img decoding="async" loading="lazy" fetchpriority="low" alt="Email Logo" src="/w/images/thumb/e/ed/Email-logo.png/80px-Email-logo.png" /></a>
							</span>

							<span class="headline-clipboard">Click below = Copy to Clipboard</span>

							<span class="code-select" data-social="copy-plain" data-button-image-src="/w/images/thumb/0/00/Plainlink-logo.png/80px-Plainlink-logo.png"></span>
							<span class="code-select" data-social="copy-mediawiki" data-button-image-src="/w/images/thumb/3/3d/Mediawiki-logo.png/80px-Mediawiki-logo.png"></span>
							<span class="code-select" data-social="copy-markdown" data-button-image-src="/w/images/thumb/0/07/Markdown-logo.png/80px-Markdown-logo.png"></span>
							<span class="code-select" data-social="copy-phpbb" data-button-image-src="/w/images/thumb/c/c1/Phpbb-logo.png/80px-Phpbb-logo.png"></span>

							<span class="info-selfhosted">
								<span class="preview">
									<i class="fas fa-info"></i>
									We don\'t use embedded scripts
									<i class="fas fa-chevron-down"></i>
								</span>
								<span class="policy">
									This share button is completely self-hosted by this webserver. No scripts from any of the social networks are embedded on this webserver. See also
									<a href="/wiki/Privacy_Policy_Technical_Details#Social_Share_Button">Social Share Button</a>.
								</span>
							</span>
						</span>
					</span>
				<!--/noindex-->
			<!--googleon: index-->
		</span>
	`);

	// URL-parts - for documentation see Dev/mediawiki

	const urlParts = {
		'twitter': ['https://twitter.com/intent/tweet?url=','[data-url]','&via=','[data-project]'],
		'facebook': ['https://facebook.com/sharer.php?u=','[data-url]','&text=','[data-title]'],
		'telegram': ['https://t.me/share/url?url=','[data-url]'],
		'reddit': ['https://reddit.com/submit?url=','[data-url]','&title=','[data-title]'],
		'whatsapp': ['https://api.whatsapp.com/send?text=','[data-route]','[if-data-route] ','[data-url]'],
		'linkedin': ['https://www.linkedin.com/shareArticle?mini=true&url=','[data-url]','&summary=','[data-title]'],
		'ycombinator': ['https://news.ycombinator.com/submitlink?u=','[data-url]','&t=','[data-title]'],
		'mastodon': ['https://fosstodon.org/share?message=','[data-route]','[if-data-route] ','[data-url]','&t=','[data-title]'],
		'email': ['mailto:?subject=','[data-title]','&body=','[data-url]'],
		'copy-plain': ['[data-url]'],
		'copy-mediawiki': ['[[', '[data-route]', '[if-data-chapter]#','[data-anchor]', '|', '[data-title]', '[if-data-chapter] chapter ', '[data-chapter]', ']]'],
		'copy-markdown': ['[','[data-title]','[if-data-chapter] chapter ','[data-chapter]',' in ','[data-project]',' wiki](','[data-url]',')'],
		'copy-phpbb': ['[url=','[data-url]',']','[data-title]','[if-data-chapter] chapter ','[data-chapter]',' in ','[data-project]',' wiki[/url]'],
	};

	const projectMap = {
		kicksecure: 'Kicksecure',
		whonix: 'Whonix',
	};

	let urlBaseData = {};
	if( window.location.href.match(/\/w\/index\.php/) ) {
		let search = new URLSearchParams( window.location.search );
		search.delete( 'title' );
		search.delete( 'stable' );
		let searchString = ( Array.from(search.values()).length ? '?' + search.toString() : '' );
		urlBaseData.route = ( window.location.href.match(/(?<=title\=)[^#&$]+/g) || [''] )[0];
		urlBaseData.url = window.mwDev.data.app.baseUrl.match( /https:\/\/[^\/]+/g ) + '/wiki/' + urlBaseData.route + searchString;
	} else {
		urlBaseData.route = ( window.location.href.match(/(?<=\/wiki\/)[^#?$]+/g) || [''] )[0];
		urlBaseData.url = window.mwDev.data.app.baseUrl;
	}

	// ----------------
	// JQuery extension


	$.fn.shareTooltip = function( action ) {
		// Only allow 'init' at the moment (extendable later)
		if( action != 'init' ) return;

		$(this).each( function() {
			// Prevent double initialization
			if( $(this).hasClass('fully-enriched') ) return;

			let share = $(this);
			share.append( innerDom.clone() );

			// Indicate finalization and display element (important for position calculation)
			share.addClass('fully-enriched');

			// Setup

			let data = {};

			if( share.attr('data-anchor') ) {
				data.anchor = share.attr('data-anchor');
				data.chapter = share.attr('data-anchor');

				// Correcting the selector by escaping common document.querySelector-unfriendly characters
				let domChapter = $( '#' + data.chapter.replace( /([:\/\.])/g, '\\$1' ) );

				// If explicit chapter title is set use it as chapter title
				if( share.attr('data-chapter') ) {
					data.chapter = share.attr('data-chapter');
				}
				// If id points to an element with just text use that text as the chapter title
				else if( domChapter.children().length == 0 && domChapter.text() ) {
					data.chapter = domChapter.text();
				}
				// If all else fails then use the ID and replace '_' with space
				else {
					data.chapter = data.chapter.replace( /_/g, ' ' );
				}
			}

			data.url = urlBaseData.url + ( share.attr('data-anchor') ? '#' + share.attr('data-anchor') : '' );
			data.route = urlBaseData.route;

			data.title = $('html head title').text();

			data.project = window.location.href.match(/[^:\/.]+\.[^\/#?]+/g)[0].match(/[^.]+\.[^.]+$/g)[0].match(/^[^.]+/g)[0];
			data.project = projectMap[ data.project ] || data.project;


			// Fill Fields for social and for Copy-to-clipboard

			share.find('.social,.code-select').each(function() {
				let platform = $(this).attr('data-social');
				let shareText = '';
				for( const urlPart of urlParts[ platform ] ) {
					// If value for this part is truthy then render the rest
					if( urlPart.match(/\[if-data-/) ) {
						shareText += ( data[ urlPart.replace( /\[if-data-|\].*/g, '' ) ] ? urlPart.replace( /^[^\]]+\]/g, '' ) : '' );
					}
					// If this part starts with '[data-' then it needs concrete data
					else if( urlPart.match(/\[data-/) ) {
						shareText += data[ urlPart.replace( /\[data-|\]/g, '' ) ] || '';
					}
					// In any other case just use the static urlPart string
					else {
						shareText += urlPart;
					}
				}

				if( $(this).hasClass('social') ) {
					share.find('.social[data-social=' + platform + '] a').attr( 'href', encodeURI( shareText ) );
				} else {
					share.find('.code-select[data-social=' + platform + ']').text( shareText );
				}
			});

			// Init CodeSelect and fill fields

			share.find('.code-select').codeSelect('init');

			// Positioning (for menus who overflow the screen)

			let paddingRight = 10;
			let button = share.find('.button');
			let menuOverflow = $(window).width() - button.offset().left - share.find('.menu-wrapper').outerWidth();

			if( menuOverflow < 0 ) {
				share.find('.menu-wrapper').css('left', menuOverflow - paddingRight );
			}

			// Event: Click privacy policy

			share.find('.info-selfhosted').click( function() {
				$(this).toggleClass('full-text');
			});
		});
	};

	// Enrichment of all Share Tooltip elements

	$('.share-tooltip').shareTooltip('init');

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['ShareTooltip.js'] = true;


}





/* === DebugViaUrlModal.js ================================================== */





if( mwDev.data.log.jsload['DebugViaUrlModal.js'] !== false ) {

/*
DebugViaUrlModal Gadget - JS Initialisation, Setup, Events. Adds a modal to the header super menu with several debugging options
See detailed documentation in Dev/mediawiki
deferrable:YES -- Because it's a gadget and is not a needed dependency
*/

(function() {

	if( ! mwDev ) {
		console.error( 'mwDev needs to be declared. Devs: see mw-combine for clarification' );
		return;
	}

	// If there's not custom Header then this functionality can be aborted
	if( ! $('#custom-header').length ) return;

	// -------
	// Prepare

	let baseUrl = window.location.href.match(/^[^#\?]+/g)[0].replace('/wiki/Homepage','');
	let baseQuery = new URLSearchParams( window.location.search );

	let dontload = [];

	// ---
	// Fns

	function constructUrl() {
		return  baseUrl + ( baseQuery.toString() ? '?' + baseQuery.toString() : '' );
	}

	function setUrl( mode ) {
		if( mode == 'selectjs' ) {
			if( ! dontload.length ) {
				baseQuery.delete('dontload');
			} else {
				baseQuery.set( 'dontload', dontload.join(',') );
			}
		} else {
			baseQuery.set( 'dontload', mode.replace('no','') );
		}

		modal.find('.code-select .code').text( constructUrl() );
		modal.find('.direct-link').attr( 'href', constructUrl() );
	}

	// -----
	// Setup

	let initialUrl = constructUrl();

	let modal = $(
		`<div class="mini-modal" id="debug-via-url-modal">
			<h2>Disable server cache for this browser</h2>
			<span class="activate-nocache-cookie-for-server${ Cookies.get( 'nocache' ) ? ' active' : '' }">Activate <b>nocache (true)</b> server cookie for my browser</span>
			<h2>Debug vis URL</h2>
			<div class="code-select">${initialUrl}</div>
			<a class="direct-link" target="_blank" href="${initialUrl}"></a>
			<div class="info">
				Debugging helper: Click the scripts below to generate a link in which they are de/activated.
				Use CodeSelect or the link button above!
			</div>
			<div class="switcher">
				<div data-mode="selectjs" class="active">Select JS</div>
				<div data-mode="nojs">No JS</div>
				<div data-mode="nocss">No CSS</div>
				<div data-mode="nojscss">No JS+CSS</div>
			</div>
			<div class="dontload-options"></div>
		</div>`
	);

	$('body').append( modal );

	for( let file in mwDev.data.log.jsload ) {
		modal.find('.dontload-options').append( '<div' + ( mwDev.data.log.jsload[file] ? ' class="loaded"' : '' ) + '>' + file + '</div>' );
	}

	modal.miniModal('init');
	modal.find('.code-select').codeSelect('init');
	modal.find('.content').addClass('selectjs');

	// Debug Modal trigger

	let debugModalTrigger = $('<a class="debug-modal-trigger" href="#"><i class="fa-solid fa-code"></i>Debug Helper</a>').insertAfter('#custom-header .super-menu .print');

	// ------
	// Events

	// Event: Un/select dontload option

	modal.find('.dontload-options > *').on( 'click', function() {
		$(this).toggleClass('loaded');

		dontload = [];
		$(this).parent().children().each( function() {
			if( ! $(this).hasClass('loaded') ) {
				let name = $(this).text().match(/(?<=:).*(?=\.)/);
				if( name ) dontload.push( name[0] );
			}
		});

		setUrl( 'selectjs' );
	});

	// Event: Switch to another option

	modal.find('.switcher > *').on( 'click', function() {
		$(this)
			.addClass('active')
			.siblings().removeClass('active');

		modal
			.removeClass( 'selectjs nojs nocss nojscss' )
			.addClass( $(this).attr('data-mode') );

		if( $(this).attr('data-mode') == 'selectjs' ) modal.find('.dontload-options').css( 'display', '' );
		else modal.find('.dontload-options').css( 'display', 'none' );

		setUrl( $(this).attr('data-mode') );
	});

	// Event: Show Debug js modal

	debugModalTrigger.on( 'click', function() {
		$('#debug-via-url-modal').miniModal('show');
		return false;
	});

	// Event: De/activate nocache server cookie

	modal.find('.activate-nocache-cookie-for-server').on( 'click', function() {
		$(this).toggleClass('active');
		if( $(this).hasClass('active') ) Cookies.set( 'nocache', true, { expires: 365, sameSite: 'strict' } );
		else Cookies.remove( 'nocache' );
	});

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['DebugViaUrlModal.js'] = true;


}





/* === EnhanceHeadlines.js ================================================== */





if( mwDev.data.log.jsload['EnhanceHeadlines.js'] !== false ) {

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

mwDev.data.log.jsload['EnhanceHeadlines.js'] = true;


}





/* === EditorSaveAndContinue.js ================================================== */





if( mwDev.data.log.jsload['EditorSaveAndContinue.js'] !== false ) {

/*
EditorSaveAndContinue Gadget - JS Initialisation, Setup, Events. Adds a Save continue button to the editor so the page is not reloaded everytime
See detailed documentation in Dev/mediawiki
deferrable:YES -- Because it's an augmentation and not needed as a dependency
*/

(function() {

	let editorSaveModal = $(''
		+ '<div class="mini-modal" id="saveAndContinueMiniModal">'
		+  '<iframe />'
		+ '</div>'
	);

	// Setup

	$('#editform .editButtons').prepend( $( '<span class="save-and-continue">Save continue</span>' ) );

	$('body').append(editorSaveModal);

	editorSaveModal.miniModal('init');

	// Event

	$('#editform .save-and-continue').on( 'click', function() {
		// if ace editor is activated (in js and css files) transfer latest editor text to mediawiki textarea
		if( $('.ace_editor').length ) {
			$('.ace_editor').attr('id','ace_editor');
			$('#wpTextbox1').val( ace.edit('ace_editor').getValue() );
		}

		$.ajax({
			url: $('#editform').attr('action'),
			type: $('#editform').attr('method').toUpperCase(),
			data: $('#editform').serialize(),
			success: function( response ) {
				editorSaveModal.miniModal('show');
				editorSaveModal.find('.content iframe').contents().find('body').html(response);
			},
		});
	});
})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['EditorSaveAndContinue.js'] = true;


}





/* === SearchModal.js ================================================== */





if( mwDev.data.log.jsload['SearchModal.js'] !== false ) {

/*
SearchModal Gadget - JS Initialisation, Setup, Events. Moves the search to a separate modal with is opened from the custom header
See detailed documentation in Dev/mediawiki
deferrable:YES -- Because it's an augmentation / gadget and is not needed as a depedency
*/

(function() {

	if( $('#custom-header').length == 0 ) return;

	// -----
	// Setup

	let modal = $('<div class="mini-modal" id="top-bar-search-modal"></div>');
	$('body').append( modal );
	modal.miniModal('init');

	// Transform main Search to Vector Skin


	//  Move SearchForm to Modal

	let search = $('#p-search');

	modal.find('.content').append( search );

	// ------
	// Events

	modal.on('shown.miniModal', function() {
		if( ! modal.hasClass('modal-initialized') ) {
			$('#searchInput').focus();
		}

		let inputName, inputNameOptions = ['vector-search-box-input','input.wvui-input__input'];
		for( const name of inputNameOptions ) {
			if( search.find( '.' + name ).length ) {
				inputName = name;
				break;
			}
		}

		search.find( '.' + inputName ).val('');
		search.find( '.' + inputName ).focus();

		modal.addClass('modal-initialized');
	});

	// ------
	// Events

	// Event: Search Button click

	$('#custom-header .search').on( 'click', function(e) {
		$('#top-bar-search-modal').miniModal('show');
		e.preventDefault();
	});

})();

 /*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['SearchModal.js'] = true;


}





/* === Header.js ================================================== */





if( mwDev.data.log.jsload['Header.js'] !== false ) {

/*
Custom Header - JS Initialisation, Setup, Events
See detailed documentation in Dev/mediawiki
deferrable:YES -- It needs time for loading anyways
*/

(function() {

	if( $('#custom-header').length == 0 ) return;


	// -----
	// Setup


	// Setup of super menu by current user status and watching status


	if( $('#pt-userpage').length > 0 ) {
		$('#custom-header .super-menu .headline.user').text('User: ' + $('#pt-userpage > a').text() );
	}

	// Watch indicator
	if( $('#ca-unwatch').length != 0 ) {
		$('body').addClass('page-is-watched');
	}

	// If no oldid was given in the search params, remove oldid from edit link
	let q = new URLSearchParams( window.location.search.substring(1) );
	$('#custom-header .super-menu .edit').attr( 'href', function( index, href ) {
		if( ! q.get('oldid') ) return href.replace( /&oldid=[^&$]+/, '' );
	});


	// Make Menu Buttons Links if it's NOT a JS active touch device


	$( '#custom-header .nav-menu .button[data-link]' ).each( function() {
		if( ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 ) ) return;

		$( `<a class="button" href="${$(this).attr('data-link')}">${$(this).text()}</a>` ).insertAfter( $(this) );
		$(this).remove();
	});


	// ------
	// Events


	// Make MouseIn over header menu (nav menu and super menu) activate header menu


	let headerMenus = $('#custom-header .header-menu');
	let headerMenuLocked;

	headerMenus.each( (i,headerMenu) => $(headerMenu).on( 'mouseleave', () => { $(headerMenu).removeClass('active'); console.log(headerMenu) } ) );

	headerMenus.each( (i,headerMenu) => $(headerMenu).children('.menu-button').on( 'mouseenter click', () => {
		if( $(headerMenu).hasClass('active') || headerMenuLocked ) return;

		headerMenuLocked = true;
		$(headerMenu).addClass('active');
		setTimeout( () => { headerMenuLocked = false; }, 50 );
	}));

	headerMenus.each( (i,headerMenu) => $(headerMenu).children('.menu-button').on( 'click', function() {
		if( ! $(headerMenu).hasClass('active') || headerMenuLocked ) return;

		headerMenuLocked = true;
		$(headerMenu).removeClass('active');
		setTimeout( () => { headerMenuLocked = false; }, 50 );
	}));

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['Header.js'] = true;


}





/* === Pages.js ================================================== */





if( mwDev.data.log.jsload['Pages.js'] !== false ) {

/*
MultiWiki: On this page there is functionality for specific pages.
See detailed documentation in Dev/mediawiki
deferrable:YES -- It comes later in the rendering process anyways
*/

(function() {

	// ==============
	// Page: Homepage

	if( $('body').hasClass('page-Homepage') ) {

		let scrollMargin = 70;

		// Section Banner

		// Event : Click on the hero image starts video
		$( '#hide-overview-image' ).on( 'change', () => $( '.overview-image-and-video-player video' )[0].play() );

		// Event : Click on video. Improve player with pause / play on video
		$( '.overview-image-and-video-player video' ).on( 'click', function() {
			if( this.paused ) this.play();
			else this.pause();
		});

		// Section Competition

		$('.section-competition .show-more').on( 'click', function() {
			$(this).remove();
			$('.section-competition .show-for-nojs-only').removeClass('show-for-nojs-only');
		});

		$('.section-features, .section-values').find('.col-container .card-wrapper').each( function() {

			// Setup

			let id = $(this).attr('id');

			// Replace a-anchor with div (to make text selectable)
			let linkReplacement = $('<div></div>');
			linkReplacement.append( $(this).find( 'a > *' ) );
			$(this).children().replaceWith( linkReplacement );

			// Add share link to modal
			let shareButtonForModal = $( `<span class="code-select" data-button-image-src="/w/images/thumb/9/9f/Share-icon.png/40px-Share-icon.png">${ window.mwDev.data.app.baseUrl }#${id}</span>` );
			$( '#modal-' + id ).append( shareButtonForModal );
			shareButtonForModal.codeSelect('init');

			// Add attribute to modal to make it react to url hash
			$( '#modal-' + id ).attr( 'data-url-hash', id );

			// When there is a hash corresponding to a card, highlight that card
			if( $( urlObj.hash ).length ) $( urlObj.hash ).addClass( 'hash-target' );

			// Events

			// If there's no text selection, open modal and change url

			linkReplacement.on( 'click', function() {
				let sel = window.getSelection();
				if( sel && sel.type != 'None' && ! sel.isCollapsed ) return;
				$( '#modal-' + id ).miniModal('show');
			});

		});

		// Section Features and Section Values

		let urlHash = mwDev.tools.hashControl.get();
		if( urlHash && urlHash.match( /^explain-/ ) ) {
			// Open extendable box containing card
			let collapseContainer = $( urlHash ).parents('.mw-collapsed');
			if( collapseContainer.length ) collapseContainer.find('.mw-collapsible-toggle')[0].click();
			$('html, body').stop().animate( { 'scrollTop': $( '#' + urlHash ).offset().top - scrollMargin }, 800, 'swing', () => $(window).miniModal('checkForModalsCalledByHash') );
		}

	}

	// ==================
	// Page: Dev/wikitest

	if( $('body').hasClass('page-Dev_wikitest') ) {
		$(window).miniModal('checkForModalsCalledByHash');
		$('#open-mini-modal-test').on( 'click', () => $('#mini-modal-test').miniModal('show') );
	}

})();

/*
[[Category:MultiWiki]]
*/

mwDev.data.log.jsload['Pages.js'] = true;


}





/* === LocalPages.js ================================================== */





if( mwDev.data.log.jsload['LocalPages.js'] !== false ) {

/*
LocalWiki: On this page there is functionality for specific pages, only on this wiki.
See detailed documentation in Dev/mediawiki
deferrable:YES -- It comes later in the rendering process anyways
*/

(function() {

})();

mwDev.data.log.jsload['LocalPages.js'] = true;


}





/* === mw-combine.php : End of auto-generated wrapper function for all JavaScript ================================================== */





	

	// Hash Control initial trigger
	mwDev.tools.hashControl.trigger( 'initial' );

	// Log completed Page Loading
	mwDev.tools.test.pageLoading('pageLoadFinished');
}

if( window.mediaWikiCommonJsIsLoaded ) {
	triggerWhenReady();
} else {
	window.addEventListener( 'mediaWikiCommonJsIsLoaded', triggerWhenReady );
}

/*
[[Category:MultiWiki]]
*/






/* === mw-combine.php : Autogeneration success ================================================== */






/*
Fully JS EndofYear Sitenotice, init events etc
See detailed documentation in Dev/mediawiki
*/

function initEndOfYearSitenotice( domElementToPrependTo, assetWikiUrl = '', contentForSlides ) {

	// Basic error checks
	if( ! contentForSlides ) console.error('Dev: contentForSlides is missing but needed. Please check for errors');
	if( ! domElementToPrependTo ) console.error('Dev: domElementToPrependTo is missing but needed. Please check for errors');
	if( ! contentForSlides || ! domElementToPrependTo ) return;

	// Will not be executed after 2022-31-12 23:59:59
	if( Date.now() > 1672527599000 ) return;

	// If the user has the dismissed less than a week ago, it will not be executed
	if( localStorage.getItem('dismiss-end-of-year-sitenotice') > Date.now() ) {
		$('#siteNotice').addClass('hide-notice');
		return;
	}
	// Else remove item (because it's not valid) if it exists
	localStorage.removeItem('dismiss-end-of-year-sitenotice');

	// --------------------
	// Settings and Globals

	let settings = {
		durationSlide: 10000, // Milliseconds
		durationProgressbar: 9500, // Milliseconds
		mobileBreak: 660, // Pixels
		paymentBottomBorderSpace: 15, // Pixels
	};

	let refs = {
		playNextTimeout: null,
	};

	let states = {
		slideIndex: null,
		slideCount: 0,
		isPlay: null,
		crypto: { payBitcoin: '', payMonero: '', payEthereum: '', },
	};

	// ---
	// DOM

	$('#siteNotice').addClass('show-notice');

	let endOfYear = $(`
		<div id="donate-end-of-year" class="robots-nocontent">
			<!--googleoff: index-->
				<!--noindex-->
					<div class="h1">
						<i class="fas fa-times dismiss"></i>
						<span>Please support us!</span>
					</div>
					<div class="slideshow">
						<div class="content"></div>
						<div class="control">
							<div class="progress"></div>
							<div class="slide-buttons"></div>
							<div class="flow">
								<i class="fas fa-pause is-play"></i>
								<i class="fas fa-play is-pause"></i>
							</div>
						</div>
					</div>
					<div class="payment">
						<div class="h2">PayPal</div>
						<div class="pay-via-paypal-module"></div>
						<div class="h2 crypto">Or Crypto<br>Addresses</div>
						<div class="crypto-container">
							<div class="code-select btc" data-button-image-src="/w/images/thumb/2/29/BC_Logo_.png/40px-BC_Logo_.png"></div>
							<div class="code-select xmr" data-button-image-src="/w/images/thumb/0/05/Monero-symbol-1280.png/40px-Monero-symbol-1280.png"></div>
							<div class="code-select eth" data-button-image-src="/w/images/thumb/2/2c/Ethereumlogo.png/40px-Ethereumlogo.png"></div>
						</div>
						<a href="${assetWikiUrl}/wiki/Donate" target="_blank">Or Other Payment Options</a>
					</div>
				<!--/noindex-->
			<!--googleon: index-->
		</div>
	`);

	let mobileDonateButtonTemplate = $('<span class="mobile-donate-button">Donate</span>');

	let hiddenHelperContainer = $('<div style="position: fixed; opacity: 0;"></div>');

	// ---
	// FNs

	function switchSlide( slideButton ) {
		endOfYear.find('.slideshow .content > div').removeClass('active');
		endOfYear.find('.slideshow .control > .slide-buttons span').removeClass('active');

		endOfYear.find('.slideshow .slide-buttons span.active').removeClass('active');
		slideButton.addClass('active');
		states.slideIndex = slideButton.index();
		let slide = endOfYear.find('.slideshow .content > div').eq( states.slideIndex );
		slide.addClass('active');
		slide.css( 'opacity', 0 );
		slide.animate( { opacity: 1 }, 300 );
	}

	function playNext( isPlay ) {
		if( isPlay != 'auto' ) {
			clearTimeout( refs.playNextTimeout );
			endOfYear.find('.slideshow .progress').stop( true );

			if( isPlay != states.isPlay ) {
				if( typeof isPlay == 'boolean' ) states.isPlay = isPlay;
				else if( isPlay == 'toggle' ) states.isPlay = ! states.isPlay;
				endOfYear.find('.slideshow .control .flow i').removeClass('active');
				endOfYear.find('.slideshow .control .flow i.is-' + ( states.isPlay ? 'play' : 'pause'  ) ).addClass('active');
			}

			if( ! states.isPlay ) return;
		}

		if( states.slideIndex == null || states.slideIndex >= states.slideCount - 1 ) states.slideIndex = 0;
		else states.slideIndex++;
		switchSlide( endOfYear.find( '.slideshow .slide-buttons span' ).eq( states.slideIndex ) );
		endOfYear.find('.slideshow .progress').css( 'width', '1%' ).stop( true ).animate( { width: '100%' }, settings.durationProgressbar );
		refs.playNextTimeout = setTimeout( () => playNext( 'auto' ), settings.durationSlide );
	}

	// -----
	// Setup

	$('body').append(hiddenHelperContainer);
	hiddenHelperContainer.append( endOfYear );

	// Imported Initializations

	endOfYear.find('.pay-via-paypal-module').payViaPaypal('init');
	endOfYear.find('.payment .crypto-container .code-select').codeSelect('init');

	// Content

	endOfYear.find('.content').html( contentForSlides );

	if( endOfYear.find('.content h1').length > 0 ) {
		endOfYear.find( '.h1 span' ).html( endOfYear.find('.content h1').html() );
		endOfYear.find('.content h1').remove();
	}

	if( endOfYear.find('.content [data-crypto-addresses]').length > 0 ) {
		let crypto = JSON.parse( endOfYear.find('.content [data-crypto-addresses]').attr('data-crypto-addresses') );
		endOfYear.find('.content [data-crypto-addresses]').remove();
		states.crypto = { ...crypto };
	}

	if( ! states.crypto.payBitcoin ) console.warn('Dev: payBitcoin is missing. Please check for errors');
	if( ! states.crypto.payMonero ) console.warn('Dev: payMonero is missing. Please check for errors');
	if( ! states.crypto.payEthereum ) console.warn('Dev: payEthereum is missing. Please check for errors');

	endOfYear.find('.payment .btc .code').text( states.crypto.payBitcoin );
	endOfYear.find('.payment .xmr .code').text( states.crypto.payMonero );
	endOfYear.find('.payment .eth .code').text( states.crypto.payEthereum );

	// Add Mobile donate link button

	if( $(window).width() <= settings.mobileBreak ) {
		endOfYear.find('.content > div').append( mobileDonateButtonTemplate.clone() );
	}

	// Iterate over slides

	let maxHeight = 0;

	endOfYear.append

	endOfYear.find('.slideshow .content > div').each( function() {
		$(this).css('display','block');
		if( $(this).outerHeight() > maxHeight ) maxHeight = $(this).outerHeight();
		$(this).css('display','');
		endOfYear.find('.slideshow .slide-buttons').append( '<span' + ( $(this).hasClass('active') ? ' class="active"' : '' ) + '></span>' );
		states.slideCount++;
	});

	// If not mobile include the height of payment
	if( $(window).width() > settings.mobileBreak ) {
		let paymentAdjustedHeight = endOfYear.find('.payment').outerHeight() - endOfYear.find('.slideshow .control').outerHeight() - settings.paymentBottomBorderSpace;
		if( paymentAdjustedHeight > maxHeight ) maxHeight = paymentAdjustedHeight;
	}

	endOfYear.find('.slideshow .content').height( maxHeight );

	// Put endOfYear container in the right place before the events as bound
	endOfYear.css( 'opacity', 0 );
	$(domElementToPrependTo).prepend(endOfYear);
	hiddenHelperContainer.remove();

	// ------
	// Events

	endOfYear.find('.slideshow .slide-buttons span').on( 'click', function() {
	  console.info([ states, $(this) ]);
		if( states.isPlay ) {
			states.slideIndex = $(this).index() - 1;
			playNext();
		} else {
			switchSlide( $(this) );
		}
	});

	endOfYear.find('.dismiss').on('click', function() {
		$('#siteNotice').animate({ height: 0, opacity: 0 }, 1000, function() {
			$(this).attr('style','display:none !important;');
		});
		localStorage.setItem('dismiss-end-of-year-sitenotice', Date.now() + 7 * 24 * 3600 * 1000 );
	});

	endOfYear.find('.slideshow .control .flow i').on( 'click', () => playNext( 'toggle' ) );

	endOfYear.find('.content .mobile-donate-button').on( 'click', function() {
		playNext( false );
		endOfYear.find('.slideshow').hide();
		endOfYear.find('.payment').show();
		endOfYear.css('height','auto');
		$('#siteNotice').css('height','auto');
	});

	// ----
	// Init

	// FadeIn endOf year the start playing the slideshow
	endOfYear.animate( { opacity: 1}, 300 );
	playNext( true )

}

/*
[[Category:MultiWiki]]
*/
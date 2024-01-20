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
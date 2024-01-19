<?php

// ========
// Globals


$keyword = $argv[1] ?? 'kicksecure'; // Keyword passed from command line or default

$output = '';
$errors = 0;
$logFile = './build-log.htm';
$warningStyle = 'style="color: red; font-weight: bold;"';
$linebreakX4 = "\n\n\n\n";

$buildFilePath = "./{$keyword}-build.json";
$fileSrcPath = "../src/{$keyword}";
$fileAutogenPath = "../dist/{$keyword}"; // Target directory
$fileAutogenServerPath = '/mw-autogen'; // Autogen folder url path

$filePrefix = '/mw-combined-';

$generaljswrapper;


// =========
// Functions


// -----------------------
// Function : out (helper)


/**
 * Appends a text string to the global output stream that is eventually logged to a file
 *
 * This function is used to output and log text during the script's execution.
 * It can handle errors by styling them differently if specified.
 *
 * @param string $text The text to be output and logged.
 * @param bool $isError Specifies if the text is an error message (default: false).
 * @param string $altElement Alternative HTML element for output (default: 'p').
 * @return void
 */
function out( string $text, bool $isError = false, string $altElement = '' ): void {
  global $output, $warningStyle;
  $output .= '<' . ( $altElement ?: 'p' ) . ( $isError ? " {$warningStyle}" : '' ) . '>' . $text . '</' . ( $altElement ?: 'p' ) . ">\n\n";
}


// ------------------------------
// Function : execHelper (helper)


/**
 * Executes a shell command and captures its output and exit code.
 *
 * This function is a helper to execute shell commands, capture their output,
 * and log the result. It also counts errors based on the command's exit code.
 *
 * @param string $command The shell command to be executed.
 * @param bool $verbose If true, outputs detailed information (default: false).
 * @return string The output of the executed command.
 */
function execHelper( string $command, bool $verbose = false ) : string {
  global $errors;
  out( 'Executing command: ' . $command );
  exec( $command . " 2>&1", $output, $retval );
  $errors += ( $retval == 0 ? 0 : 1 );
  out( 'Exit code: ' . $retval . "\n" . 'output: ' . ( $verbose
      ? '"' . implode( '<br>', $output ) . '"'
      :  '[has ' . strlen( implode( '', $output ) ) . ' chars]'
    ),
    $retval != 0
  );
  return implode( "\n", $output );
}


// -----------------------
// Function : CombineFiles


/**
 * Combines and processes files based on the specified type and build configuration.
 * 
 * This function generates combined and optionally minified files for the specified
 * type (like 'wikijs' or 'wikicss'). It reads the list of files from the build
 * configuration and processes them accordingly.
 *
 * @param string $type The type of files to process (e.g., 'wikijs', 'wikicss').
 * @param array $build An array containing the build configuration.
 * @return void
 */
function combineFiles( string $type, array $build ) : void {
  global $keyword, $errors, $fileAutogenPath, $fileAutogenServerPath, $filePrefix, $generaljswrapper;

  // Reusable elements
  
  $headlineStart = '/* === ';
  $headlineEnd = ' ================================================== */';
  $linebreakX4 = "\n\n\n\n\n\n";
  
  // Start combining
  
  out( "CREATING combined file and minified version for {$keyword} build, file type '{$type}'", false, 'h2' );

  // Start with info about mw-combine.php
  $combined = "{$headlineStart}mw-combine.php : This file is auto-generated from the '{$type}' category of {$keyword}-build.json{$headlineEnd}";

  // Adding JavaScript specific condition (especially adding Common.js-trigger and dontload functionality for performance testing)
  if( $type == 'wikijs' ) {
    $combined .= ''
      . $linebreakX4 . $headlineStart
      . 'mw-combine.php : This wrapper is auto-generated to make all JavaScript wait for this event'
      . $headlineEnd . $linebreakX4
      . $generaljswrapper[0]
    ;
  }

  // Add the content from each file and save a copy
  
  if( ! is_array( $build[ $type ] ) ) {
  	$errors++;
		out( "Error in build.json : The value for keyword '$type' must be an array but is not.", true );
	} else {

    // TODO continue from here
	
		foreach( $build[ $type ] as $wikiFileName ) {
		  if( ! is_string( $wikiFileName ) || preg_match( '/^\/\//', $wikiFileName ) ) continue;

		  $combined .= ''
		    . $linebreakX4 . $headlineStart
		    . $wikiFileName
		    . $headlineEnd . $linebreakX4

	    ;
		  $fileTextContent = execHelper( 'php /var/www/public/wiki/w/maintenance/getText.php "' . $wikiFileName . '"' );

		  // Adding File content with JavaScript specific condition (if-clause)
		  $combined .= ''
		    . ( $type == 'wikijs' ? "if( mwDev.data.log.jsload['$wikiFileName'] !== false ) {\n\n" : '' )
		    . $fileTextContent
		    . ( $type == 'wikijs' ? "\n\nmwDev.data.log.jsload['$wikiFileName'] = true;\n\n\n}" : '' );

		  // Copy each file to autogen src-copy folder for other use cases
		  $pathSrcCopyDir = $fileAutogenPath . '/src-copy/';
		  
		  // Try to create dir if necessary. Only if successful create files
		  
		  if( ! file_exists( $pathSrcCopyDir ) ) mkdir( $pathSrcCopyDir, 0755 );
		  
      if( ! file_exists( $pathSrcCopyDir ) ) {
      	$errors++;
		    out( "Error in autogen folder : The subfolder 'src-copy' does not exist and could not be created.", true );
      } else {
      
        // Create file and minified version in source copy path from wiki file
        $filePath = $pathSrcCopyDir . preg_replace( '/(MediaWiki)?:/i', '', $wikiFileName );
        $filePathMin = preg_replace( '/\.(\w+)$/', '.min.$1', $filePath );
        file_put_contents( $filePath, $fileTextContent );
        execHelper( 'minify --output "' . $filePathMin . '" "' . $filePath . '"' );
        
      }
		}
		
  }
  
  // Adding JavaScript specific condition
  if( $type == 'wikijs' ) {
    $combined .= ''
      . $linebreakX4 . $headlineStart
      . 'mw-combine.php : End of auto-generated wrapper function for all JavaScript'
      . $headlineEnd . $linebreakX4
      . $generaljswrapper[1];
  }

  // Adding info that autogeneration has been completed
  $combined .= $linebreakX4 . $headlineStart . 'mw-combine.php : Autogeneration success' . $headlineEnd . $linebreakX4;

  // Save combined file and save again as minified file

  $fileExtension = $type == 'wikijs' ? '.js' : '.css';
  $fileOriginalPath = $fileAutogenPath . $filePrefix . $type . $fileExtension;
  $fileMinified = $filePrefix . $type . '.min' . $fileExtension;
  $fileMinifiedPath = $fileAutogenPath . $fileMinified;
  $fileMinifiedUrl = $fileAutogenServerPath . $fileMinified;

  file_put_contents( $fileOriginalPath, $combined );
  
  if( $type == 'wikijs' )
    execHelper( "uglifyjs '$fileOriginalPath' --output '$fileMinifiedPath' --source-map \"base='$fileAutogenPath',root='$fileAutogenServerPath',url='$fileMinifiedUrl.map'\"", true );
  else
    execHelper( "minify --output '$fileMinifiedPath' '$fileOriginalPath'", true );
  
  /* +++ Deactivated due to server solving this +++
  Use gzip with --no-name to remove timestamp for deterministic output.
  execHelper( 'gzip --no-name --force --keep --best "' . $fileMinifiedPath . '"', true );
  execHelper( 'brotli --force --keep --best "' . $fileMinifiedPath . '"', true );
  out( 'Success: Created combined ' . $type . ' file and minified version, gzip and brotli version', false, 'h2' );
  */
}


// =======
// Execute


out( 'Loading Script ...', false, 'h2' );

// Load and parse Build json

out( 'Loading and parsing MediaWiki:Build.json', false, 'h2' );
$build = json_decode( execHelper( 'php /var/www/public/wiki/w/maintenance/getText.php "MediaWiki:Build.json"' ), true );

// Fill wrappper for use in output

$generaljswrapper = ( isset( $build['generaljswrapper'] )
  ? explode( '/*WRAPPEDCONTENT*/', execHelper( 'php /var/www/public/wiki/w/maintenance/getText.php "' . $build['generaljswrapper'] . '"' ) )
  : ['','']
);

// Combine files and / or just copy according to Build.json

combineFiles( 'wikijs', $build );
combineFiles( 'wikicss', $build );
combineFiles( 'skincss', $build );
combineFiles( 'justcopy', $build, false );

// +++ Deactivated : Slow. Not needed. Use cookie "nocache" being set to "true" instead. +++
// execHelper( 'sudo --non-interactive cacheclear-nginx', true );

out( 'Success: Script completed!', false, 'h2' );

// Output

echo ''
  . '<html><head><title>'
  . ( $errors > 0 ? 'ERRORS! (' . $errors . ')' : 'SUCCESS' ) . ( isset( $_SERVER['HTTP_HOST'] ) ? ' - ' . $_SERVER['HTTP_HOST'] : '' )
  . '</title></head><body>'
  . $output
  . '</body></html>';



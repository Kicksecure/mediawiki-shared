<?php

// ==========
// 1. Globals


$keyword = $argv[1] ?? 'kicksecure'; // Keyword passed from command line or default

$output = '';
$errors = 0;
$logFile = './build-log.htm';
$warningStyle = 'style="color: red; font-weight: bold;"';
$linebreakX4 = "\n\n\n\n";

$paths = array(
  "shared-config-file" => "./config-build-shared.json",
  "shared-src-folder" => "../src/shared/",
  "keyword-config-file" => "./config-build-{$keyword}.json",
  "keyword-src-folder" => "../src/{$keyword}/",
  "autogen-folder" => "../dist/{$keyword}/",
  "autogen-src-copy-folder" => "../dist/{$keyword}/src-copy/",
  "autogen-server-url" => '/mw-autogen/'
);

$filePrefix = 'mw-combined-';

$generaljswrapper;


// ============
// 2. Functions


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
 * @param array $configs An array ['shared'=>...,'keyword'=>...] containing the build configuration for shared and keyword
 * @return void
 */
function combineFiles( string $type, array $configs ) : void {

  global $keyword, $errors, $paths, $filePrefix, $generaljswrapper;

  if( $type == 'justcopy' ) out( 'CREATING copies of source files for build["' . $type . '"]', false, 'h2' );
  else out( 'CREATING combined file, minified version and copies of source files for build["' . $type . '"]', false, 'h2' );

  // Reusable elements
  
  $headlineStart = '/* === ';
  $headlineEnd = ' ================================================== */';
  $linebreakX4 = "\n\n\n\n\n\n";
  
  // Start combining

  // Start with info about mw-combine.php
  $combined = "{$headlineStart}build-mw-combine.php : This file is auto-generated from the '{$type}' category of {$keyword}{$headlineEnd}";

  // Adding JavaScript specific condition (especially adding Common.js-trigger and dontload functionality for performance testing)
  if( $type == 'wikijs' ) {
    $combined .= ''
      . $linebreakX4 . $headlineStart
      . 'mw-combine.php : This wrapper is auto-generated to make all JavaScript wait for this event'
      . $headlineEnd . $linebreakX4
      . $generaljswrapper[0]
    ;
  }

  // Add the content from each file
    
  foreach( [ 'shared', 'keyword' ] as $key ) {

    // If type is not set for this keyword, try next keyword
    if( ! isset( $configs[ $key ][ $type ] ) || ! is_array( $configs[ $key ][ $type ] ) ) continue;

    foreach( $configs[ $key ][ $type ] as $srcFileName ) {

      // If srcFileName is comment (starting with //) then skip this file name
      if( ! is_string( $srcFileName ) || preg_match( '/^\/\//', $srcFileName ) ) continue;

      // Write file name headline
      $combined .= $linebreakX4 . $headlineStart . $srcFileName . $headlineEnd . $linebreakX4;

      $srcFileContent = file_get_contents( $paths[ "$key-src-folder" ] . $srcFileName );

      // Adding File content to combined with JavaScript specific condition (if-clause)
      $combined .= ''
        . ( $type == 'wikijs' ? "if( mwDev.data.log.jsload['$srcFileName'] !== false ) {\n\n" : '' )
        . $srcFileContent
        . ( $type == 'wikijs' ? "\n\nmwDev.data.log.jsload['$srcFileName'] = true;\n\n\n}" : '' );
      
      // Create file and minified version in source copy path from wiki file
      $filePath = $paths[ 'autogen-src-copy-folder' ] . $srcFileName ;
      $filePathMin = preg_replace( '/\.(\w+)$/', '.min.$1', $filePath );
      file_put_contents( $filePath, $srcFileContent );
      execHelper( 'minify --output "' . $filePathMin . '" "' . $filePath . '"' );

    }

  }

  // +++ Skip combine part of function IF type is justcopy +++
  if( $type == 'justcopy' ) return;
  
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
  $fileOriginalPath = $paths['autogen-folder'] . $filePrefix . $type . $fileExtension;
  $fileMinifiedName = $filePrefix . $type . '.min' . $fileExtension;
  $fileMinifiedPath = $paths['autogen-folder'] . $fileMinifiedName;
  $fileMinifiedUrl = $paths[ 'autogen-server-url' ] . $fileMinifiedName;

  file_put_contents( $fileOriginalPath, $combined );
  
  if( $type == 'wikijs' )
    execHelper( "uglifyjs '$fileOriginalPath' --output '$fileMinifiedPath' --source-map \"base='" . $paths['autogen-folder'] . "',root='" . $paths[ 'autogen-server-url' ] . "',url='{$fileMinifiedUrl}.map'\"", true );
  else
    execHelper( "minify --output '{$fileMinifiedPath}' '{$fileOriginalPath}'", true );
  
}


// ============
// 3. Execution

out( 'STARTING build process ...', false, 'h2' );

// Load and parse build config files for shared and kewyword
$configs = array(
  'shared' => json_decode( file_get_contents( $paths[ 'shared-config-file' ] ), true ),
  'keyword' => json_decode( file_get_contents( $paths[ 'keyword-config-file' ] ), true )
);

// Extract js wrapper from shared config
$generaljswrapper = explode( '/*WRAPPEDCONTENT*/', file_get_contents( $paths[ 'shared-src-folder' ] . $configs['shared']['generaljswrapper'] ) );

// Try to create dir for source copy if necessary or empty it. If fails, exit with error
if( ! file_exists( $paths[ 'autogen-src-copy-folder' ] ) ) mkdir( $paths[ 'autogen-src-copy-folder' ], 0755 );
if( ! file_exists( $paths[ 'autogen-src-copy-folder' ] ) ) {
  $errors++;
  out( "Error in autogen folder : The subfolder 'src-copy' does not exist and could not be created.", true );
}
execHelper( "rm {$paths[ 'autogen-src-copy-folder' ]}/*" );

// Combine files or just copy according to config
combineFiles( 'wikijs', $configs );
combineFiles( 'wikicss', $configs );
combineFiles( 'skincss', $configs );
combineFiles( 'justcopy', $configs );

out( 'COMPLETED build process', false, 'h2' );

// Output - prepend to existing log file

file_put_contents(  $logFile, ''
  . "{$linebreakX4}<div><br><hr><hr><hr><hr><hr><hr><br></div>{$linebreakX4}"

  . '<h1' . ( $errors > 0 ? " {$warningStyle}" : '' ) . '>'
    . strtoupper($keyword) . ' wiki build process (' . date( 'Y-m-d H:i:s' ) . ') : '
    . ( $errors > 0 ? "{$errors} ERRORS!" : 'SUCCESS' )
  . "</h1>{$linebreakX4}"

  . "<p>{$keyword} build config file : {$paths[ 'keyword-config-file' ]}</p>"
  . "<p>Shared build config file : {$paths[ 'shared-config-file' ]}</p>"

  . $output

  . ( file_exists( $logFile ) ? file_get_contents( $logFile ) : '' )
 );

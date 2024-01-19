#!/bin/bash

# Directory where mw-combine.php is located
SCRIPT_PATH="./mw-combine.php"

# Call mw-combine.php for each keyword
php "$SCRIPT_PATH" kicksecure
php "$SCRIPT_PATH" whonix

echo "Build process completed."

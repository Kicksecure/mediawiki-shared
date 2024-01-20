#!/bin/bash

# Prompt user to input git commit message. If empty then exit
read -p "--- Enter git commit message: " commit_message
if [ -z "$commit_message" ]; then
    echo "Commit message is empty. Exiting."
    exit 1
fi

echo "--- Executing ..."

# Run the build.sh script
./build.sh

# Push to git
git add -A
git commit -m "$commit_message"
git push

# Wait for 2 seconds to ensure servers have time to fetch the latest git state
sleep 2

echo "--- Triggering servers to pull from git"

# Trigger servers to fetch from git
../../local-git-wiki-push.sh

# Completion message and prompt to keep the terminal window open
echo "--- Process completed! Press any key to exit."
read -n 1 -s -r

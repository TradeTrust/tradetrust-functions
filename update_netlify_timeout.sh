#!/bin/bash

# Path to the file
FILE="./node_modules/netlify-cli/src/utils/dev.mjs"

# Old and new values
OLD_VALUE="const SYNCHRONOUS_FUNCTION_TIMEOUT = 10"
NEW_VALUE="const SYNCHRONOUS_FUNCTION_TIMEOUT = 26"

# Check if the file exists
if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

# Check if the old value exists in the file
if grep -q "$OLD_VALUE" "$FILE"; then
  # Replace the old value with the new value
  sed -i.bak "s/$OLD_VALUE/$NEW_VALUE/" "$FILE"
  echo "SYNCHRONOUS_FUNCTION_TIMEOUT value updated successfully!"
else
  echo "Old value not found in file. No changes made."
fi

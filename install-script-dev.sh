#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

echo "Downloading dev version from github"

#download latest
wget https://github.com/Webinate/modepress-admin/archive/dev.zip
unzip -o "dev.zip" "modepress-admin-dev/*"

# Moves the server folder to the current directory
cp -r modepress-admin-dev/* .

# Remove modepress-admin folder
if [ -d "modepress-admin-dev" ]; then
	rm modepress-admin-dev -R
fi

# Remove the zip file
rm "dev.zip"


# All done
echo "Modepress Admin Tool successfully downloaded"
exit
} # this ensures the entire script is downloaded #
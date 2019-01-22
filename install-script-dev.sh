#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

echo "Downloading dev version from github"

#download latest
wget https://github.com/Webinate/mantle-admin/archive/dev.zip
unzip -o "dev.zip" "mantle-admin-dev/*"

# Moves the server folder to the current directory
cp -r mantle-admin-dev/* .

# Remove mantle-admin folder
if [ -d "mantle-admin-dev" ]; then
	rm mantle-admin-dev -R
fi

# Remove the zip file
rm "dev.zip"


# All done
echo "mantle Admin Tool successfully downloaded"
exit
} # this ensures the entire script is downloaded #
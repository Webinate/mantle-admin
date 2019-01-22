#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
version() {
  echo "0.2.3"
}

echo "Downloading latest version from github $(version)"

#download latest
wget https://github.com/Webinate/mantle-admin/archive/v$(version).zip
unzip -o "v$(version).zip" "mantle-admin-$(version)/*"

# Moves the server folder to the current directory
cp -r mantle-admin-$(version)/* .

# Remove mantle-admin folder
if [ -d "mantle-admin-$(version)" ]; then
	rm mantle-admin-$(version) -R
fi

# Remove the zip file
rm "v$(version).zip"

# All done
echo "Mantle Admin Tool v$(version) successfully downloaded"
exit
} # this ensures the entire script is downloaded #
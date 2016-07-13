#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
version() {
  echo "0.2.0"
}

echo "Downloading latest version from github $(version)"

#download latest
wget https://github.com/MKHenson/modepress-admin/archive/v$(version).zip
unzip -o "v$(version).zip" "modepress-admin-$(version)/*"

# Moves the server folder to the current directory
cp -r modepress-admin-$(version)/* .

# Remove modepress-admin folder
if [ -d "modepress-admin-$(version)" ]; then
	rm modepress-admin-$(version) -R
fi

# Remove the zip file
rm "v$(version).zip"

# All done
echo "Modepress Admin Tool v$(version) successfully downloaded"
exit
} # this ensures the entire script is downloaded #
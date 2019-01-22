# Mantle Admin
A small React app for managing a Mantle Server

## Requirements
* Node v8.2.1
* MongoDb v3

## Installation

1) Make sure the requirements are installed and running
2) Create a folder for the project inside the mantle/clients folder.
For example mantle/clients/mantle-admin

```
mkdir mantle-admin
cd mantle-admin
```

3) Run as an admin / or make sure you have write privileges in the mantle-admin folder

```
sudo su
```

4) Download and install the desired version from github

If you want the latest stable version:

```
curl -o- https://raw.githubusercontent.com/Webinate/mantle-admin/master/install-script.sh | bash
```

OR if you want the dev build

```
curl -o- https://raw.githubusercontent.com/Webinate/mantle-admin/dev/install-script-dev.sh | bash
```

This downloads the latest mantle-admin project into the current folder.

5) Install the build dependencies, and then build the project

```
npm install
npm run build
```

6) Now edit the ./mantle.json to work with your server
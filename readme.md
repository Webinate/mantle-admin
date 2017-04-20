# Modepress Admin
A small angular app for managing a Modepress server.

## Current stable version
* v0.2.3

## Requirements
* Node 6.2
* [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

## Installation

1) Make sure the requirements are installed and running
2) Create a folder where you want to store the modepress-admin project

```
mkdir modepress-admin
cd modepress-admin
```

3) Run as an admin / or make sure you have write privileges in the modepress-admin folder
```
sudo su
```

4) Download and install the desired version from github

If you want the latest stable version:

```
curl -o- https://raw.githubusercontent.com/Webinate/modepress-admin/master/install-script.sh | bash
```

OR if you want the dev build

```
curl -o- https://raw.githubusercontent.com/Webinate/modepress-admin/dev/install-script-dev.sh | bash
```

This downloads the latest modepress-admin project into the current folder.

5) Install the build dependencies, and then build the project

```
npm install
gulp install
gulp build
```

This creates a ./dist folder that has the entire built frontend app. By default the build step is not
provided in a 'release' state. To create a release mode simply replace the build command with build-release

```
npm install
gulp install
gulp build-release
```

6) To setup the admin app with modepress:

First we need to add the "./dist" folder as a new target for Modepress

* Open the config json file for your modepress server. This is usually in its dist folder ./modepress-server/dist/config.json
* Create a new server block in the 'servers' property.
```
{
    "host": "admin-app.net",
    "portHTTP": 8001,
    "staticFilesFolder": ["YOUR ./DIST FOLDER PATH (MUST BE ABSOLUTE VALUE)"],
    "approvedDomains": ["admin-app\\.net"],
    "controllers": [
        { "path" : "./controllers/page-renderer.js" },
        { "path" : "./controllers/emails-controller.js" },
        { "path" : "./controllers/posts-controller.js" },
        { "path" : "./controllers/comments-controller.js" }
    ],
    "paths": [
    {
        "path": "*",
        "index": "YOUR DIST FOLDER PATH (MUST BE ABSOLUTE VALUE)/index.jade",
        "plugins": []
    }]
}
```

See the Modepress docs for more on what each of the server block properties do.
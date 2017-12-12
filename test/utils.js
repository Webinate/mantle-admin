const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const path = require( 'path' );
const yargs = require( 'yargs' );
const Agent = require( './utils/agent' );
let args = yargs.argv;

/**
 * Loads any of the sensitive props in the config json
 */
function loadSensitiveProps( config, configPath ) {
  function loadProp( parentProp, prop, path ) {
    if ( typeof ( path ) === 'string' ) {
      if ( !fs.existsSync( configPath + '/' + path ) )
        throw new Error( `Property file '${ configPath + '/' + path }' cannot be found` );
      else
        parentProp[ prop ] = JSON.parse( fs.readFileSync( configPath + '/' + path, 'utf8' ) );
    }
  }

  // Load and merge any sensitive json files
  loadProp( config, 'adminUser', config.adminUser );
  loadProp( config.remotes, 'google', config.remotes.google );
  loadProp( config.remotes, 'local', config.remotes.local );
  loadProp( config.mail, 'options', config.mail.options );
  loadProp( config, 'database', config.database );
}

/**
 * Gets the host of the server
 */
function getHost() {
  return `http://${ exports.modepress.server.host }:${ exports.modepress.server.port }`;
}

/**
 * If the user is undefined, a guest agent is returned, otherwise a user is created
 * @param {string | undefined} user The username
 * @param {string} email The user email
 * @param {string} password The user password
 */
async function createAgent( user, email, password, register = false ) {

  if ( user === undefined )
    return new Agent( getHost(), null, user, password, email );

  const agent = new Agent( getHost(), null, user, password, email );
  let resp;

  resp = await exports.admin.delete( '/api/users/' + user );
  if ( register )
    resp = await exports.admin.post( '/api/auth/register', { username: user, password: password, email: email } );
  else
    resp = await exports.admin.post( '/api/users', { username: user, password: password, email: email } );

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new Error( resp.statusText );

  if ( !register ) {
    resp = await agent.post( `/api/auth/login`, { username: user, password: password } );
    agent.updateCookie( resp );
  }

  return agent;
}

async function refreshAdminToken() {
  const resp = await exports.admin.post( '/api/auth/login', { username: exports.admin.username, password: exports.admin.password } );
  if ( resp.status >= 400 && resp.status <= 500 )
    throw new Error( resp.statusText );

  exports.admin.updateCookie( resp );
  return exports.admin;
}

/**
 * Removes a user from the system
 * @param {string} user The username of the user to remove
 */
async function removeUser( user ) {
  const resp = await exports.admin.delete( `/api/users/${ user }` );
  if ( resp.status >= 400 && resp.status <= 500 )
    throw new Error( resp.statusText );
}

async function initialize() {
  exports.browser = await puppeteer.launch( { headless: false } );
  exports.page = await exports.browser.newPage();
  exports.modepressConfig = JSON.parse( fs.readFileSync( './modepress.json' ) );
  exports.config = JSON.parse( fs.readFileSync( args.config ) );
  exports.modepress = JSON.parse( fs.readFileSync( './modepress.json' ) );
  exports.host = `${ exports.modepressConfig.server.host }:${ exports.modepressConfig.server.port }`;

  loadSensitiveProps( exports.config, path.dirname( args.config ) );

  const adminUsername = exports.config.adminUser.username;
  const adminPassword = exports.config.adminUser.password;
  const admin = new Agent( getHost(), null, adminUsername, adminPassword, exports.config.adminUser.email );
  const resp = await admin.post( `/api/auth/login`, { username: adminUsername, password: adminPassword } );
  admin.updateCookie( resp );
  exports.admin = admin;
  // Set the functions we want to expose

}

exports.initialize = initialize;
exports.createAgent = createAgent;
exports.getHost = getHost;
exports.refreshAdminToken = refreshAdminToken;

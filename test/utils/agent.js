const fetch = require( "node-fetch" );

/**
 * Represents an agent that can make calls to the backend
 */
class Agent {
  constructor( host, cookie, username, password, email ) {
    this.host = host;
    this.cookie = cookie;
    this.username = username;
    this.password = password;
    this.email = email;
  }

  async get( url, type = 'application/json', options = {} ) {
    const headers = {};
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;

    return await fetch( `${ this.host }${ url }`, Object.assign( {}, { headers: headers }, options ) );
  }

  async put( url, data, type = 'application/json' ) {
    const headers = {};
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;

    return await fetch( `${ this.host }${ url }`, {
      method: 'PUT',
      headers: headers,
      body: type === 'application/json' ? JSON.stringify( data ) : data
    } );
  }

  async post( url, data, type = 'application/json', optionalHeaders = {} ) {
    const headers = Object.assign( {}, optionalHeaders );
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;

    return await fetch( `${ this.host }${ url }`, {
      method: 'POST',
      headers: headers,
      body: type === 'application/json' ? JSON.stringify( data ) : data
    } );
  }

  async delete( url, data, type ) {
    const headers = {};
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;

    return await fetch( `${ this.host }${ url }`, {
      method: 'DELETE',
      headers: headers
    } );
  }

  getSID() {
    return this.cookie ? ( this.cookie.split( '=' )[ 1 ] ) : '';
  }

  /**
   * Updates the cookie of the agent
   * @param {string} response
   */
  updateCookie( response ) {
    this.cookie = response.headers.get( "set-cookie" ).split( ";" )[ 0 ];
  }
}

module.exports = Agent;
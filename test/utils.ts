import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { IConfig, IClient, IServer, IAdminUser } from 'modepress';
import Agent from './utils/agent';

let args = yargs.argv;

export class Utils {

  public admin: Agent;
  public browser: Browser;
  public page: Page;
  public modepress: IClient;
  public config: IConfig;
  public host: string;

  /**
   * Loads any of the sensitive props in the config json
   */
  private loadSensitiveProps( config: IConfig, configPath: string ) {

    function loadProp( parentProp: any, prop: string, path: string | any ) {
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
  public getHost() {
    const server = this.modepress.server as IServer;
    return `http://${ server.host }:${ server.port }`;
  }

  /**
   * If the user is undefined, a guest agent is returned, otherwise a user is created
   * @param user The username
   * @param email The user email
   * @param password The user password
   */
  async createAgent( user: string, email: string, password: string, register: boolean = false ) {

    if ( user === undefined )
      return new Agent( this.getHost(), null, user, password, email );

    const agent = new Agent( this.getHost(), null, user, password, email );
    let resp;

    resp = await this.admin.delete( '/api/users/' + user );
    if ( register )
      resp = await this.admin.post( '/api/auth/register', { username: user, password: password, email: email } );
    else
      resp = await this.admin.post( '/api/users', { username: user, password: password, email: email } );

    if ( resp.status >= 400 && resp.status <= 500 )
      throw new Error( resp.statusText );

    if ( !register ) {
      resp = await agent.post( `/api/auth/login`, { username: user, password: password } );
      agent.updateCookie( resp );
    }

    return agent;
  }

  async refreshAdminToken() {
    const resp = await this.admin.post( '/api/auth/login', { username: this.admin.username, password: this.admin.password } );
    if ( resp.status >= 400 && resp.status <= 500 )
      throw new Error( resp.statusText );

    this.admin.updateCookie( resp );
    return this.admin;
  }

  /**
   * Removes a user from the system
   * @param user The username of the user to delete
   */
  async removeUser( user: string ) {
    const resp = await this.admin.delete( `/api/users/${ user }` );
    if ( resp.status >= 400 && resp.status <= 500 )
      throw new Error( resp.statusText );
  }

  async initialize() {
    this.browser = await puppeteer.launch( { headless: false } );
    this.page = await this.browser.newPage();
    await this.page.setViewport( { width: 1024, height: 768 } );
    this.config = JSON.parse( fs.readFileSync( args.config ).toString() );
    this.modepress = JSON.parse( fs.readFileSync( './modepress.json' ).toString() );
    this.host = this.getHost();

    this.loadSensitiveProps( this.config, path.dirname( args.config ) );

    const adminUsername = ( this.config.adminUser as IAdminUser ).username;
    const adminPassword = ( this.config.adminUser as IAdminUser ).password;
    const admin = new Agent( this.getHost(), null, adminUsername, adminPassword, ( this.config.adminUser as IAdminUser ).email );
    const resp = await admin.post( `/api/auth/login`, { username: adminUsername, password: adminPassword } );

    admin.updateCookie( resp );
    this.admin = admin;
  }
}


const utils = new Utils();
export default utils;
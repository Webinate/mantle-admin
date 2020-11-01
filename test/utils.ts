import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { RegisterInput, AddUserInput, User, LoginInput, AuthResponse } from 'mantle';
import { IConfig } from 'mantle/src/types';
import { IClient, IServer } from 'mantle/src/types';
import { IAdminUser } from 'mantle/src/types';
import Agent from './utils/agent';
import { REMOVE_USER, CREATE_USER, GET_USER } from '../src/graphql/requests/user-requests';
import { REGISTER, LOGIN } from '../src/graphql/requests/auth-requests';
import AdminAgent from './utils/admin-agent';

let args = yargs.argv;

export class Utils {
  public admin: AdminAgent;
  public browser: Browser;
  public page: Page;
  public mantle: IClient;
  public config: IConfig;
  public host: string;

  /**
   * Loads any of the sensitive props in the config json
   */
  private loadSensitiveProps(config: IConfig, configPath: string) {
    function loadProp(parentProp: any, prop: string, path: string | any) {
      if (typeof path === 'string') {
        if (!fs.existsSync(configPath + '/' + path))
          throw new Error(`Property file '${configPath + '/' + path}' cannot be found`);
        else parentProp[prop] = JSON.parse(fs.readFileSync(configPath + '/' + path, 'utf8'));
      }
    }

    // Load and merge any sensitive json files
    loadProp(config, 'adminUser', config.adminUser);
    loadProp(config.remotes, 'google', config.remotes.google);
    loadProp(config.remotes, 'local', config.remotes.local);
    loadProp(config.mail, 'options', config.mail.options);
    loadProp(config, 'database', config.database);
  }

  /**
   * Gets the host of the server
   */
  public getHost() {
    const server = this.mantle.server as IServer;
    return `http://${server.host}:${server.port}`;
  }

  /**
   * If the user is undefined, a guest agent is returned, otherwise a user is created
   * @param user The username
   * @param email The user email
   * @param password The user password
   */
  async createAgent(user: string, email: string, password: string, register: boolean = false) {
    if (user === undefined) return new Agent(this.getHost(), null, user, password, email);

    const agent = new Agent(this.getHost(), null, user, password, email);
    const existingUser = await this.admin.graphql<{ user: User }>(GET_USER, { user: user });

    if (existingUser.data.user) await this.admin.graphql<boolean>(REMOVE_USER, { username: user });

    if (register) {
      await this.admin.graphql<{ register: AuthResponse }>(REGISTER, {
        token: {
          username: user,
          password,
          email,
        } as RegisterInput,
      });
    }
    // this.admin.post('/api/auth/register', { username: user, password: password, email: email });
    else
      await this.admin.graphql<{ addUser: User }>(CREATE_USER, {
        token: {
          username: user,
          password,
          email,
        } as AddUserInput,
      }); // this.admin.post('/api/users', { username: user, password: password, email: email });

    if (!register) {
      let loginResp = await agent.graphql<{ login: AuthResponse }>(LOGIN, {
        token: {
          username: user,
          password,
        } as LoginInput,
      }); // await agent.post(`/api/auth/login`, { username: user, password: password });
      agent.updateCookie(loginResp.response);
    }

    return agent;
  }

  async refreshAdminToken() {
    const resp = await this.admin.graphql<{ login: AuthResponse }>(LOGIN, {
      token: { remember: true, password: this.admin.password, username: this.admin.username } as LoginInput,
    });
    this.admin.updateCookie(resp.response);
    return this.admin;
  }

  /**
   * Removes a user from the system
   * @param user The username of the user to delete
   */
  async removeUser(user: string) {
    await this.admin.graphql<{ removeUser: boolean }>(REMOVE_USER, { username: user });
    return true;
  }

  async initialize() {
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1024, height: 768 });
    this.config = JSON.parse(fs.readFileSync(args.config).toString());
    this.mantle = JSON.parse(fs.readFileSync(__dirname + '/../mantle.json').toString());
    this.host = this.getHost();

    this.loadSensitiveProps(this.config, path.dirname(args.config));

    const adminUsername = (this.config.adminUser as IAdminUser).username;
    const adminPassword = (this.config.adminUser as IAdminUser).password;
    const admin = new AdminAgent(
      this.getHost(),
      null,
      adminUsername,
      adminPassword,
      (this.config.adminUser as IAdminUser).email
    );
    const resp = await admin.graphql<{ login: AuthResponse }>(LOGIN, {
      token: { username: adminUsername, password: adminPassword } as LoginInput,
    });

    admin.updateCookie(resp.response);
    this.admin = admin;
  }
}

const utils = new Utils();
export default utils;

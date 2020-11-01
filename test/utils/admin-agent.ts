import Agent from './agent';
import { GET_USER, REMOVE_USER } from '../../src/graphql/requests/user-requests';
import { User, AddVolumeInput, Post, AddPostInput, Volume } from 'mantle';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../src/graphql/requests/media-requests';
import { ADD_POST, REMOVE_POST } from '../../src/graphql/requests/post-requests';

export type Headers = { [name: string]: string };

/**
 * Represents an admin agent that can make calls to the backend
 */
export default class AdminAgent extends Agent {
  public host: string;
  public cookie: string;
  public username: string;
  public password: string;
  public email: string;

  constructor(host: string, cookie: string | null, username: string, password: string, email: string) {
    super(host, cookie, username, password, email);
  }

  async getUser(username: string) {
    const resp = await this.graphql<{ user: User }>(GET_USER, { user: username });
    return resp.data.user;
  }

  async removeUser(username: string) {
    const resp = await this.graphql<{ removeUser: boolean }>(REMOVE_USER, { username });
    return resp.data.removeUser;
  }

  async addVolume(token: AddVolumeInput) {
    const resp = await this.graphql<{ addVolume: Volume }>(ADD_VOLUME, { token });
    return resp.data.addVolume;
  }

  async removeVolume(id: string) {
    const resp = await this.graphql<{ removeVolume: boolean }>(REMOVE_VOLUME, { id });
    return resp.data.removeVolume;
  }

  async addPost(token: AddPostInput) {
    const resp = await this.graphql<{ createPost: Post }>(ADD_POST, { token });
    return resp.data.createPost;
  }

  async removePost(id: string) {
    const resp = await this.graphql<{ removePost: Post }>(REMOVE_POST, { id });
    return resp.data.removePost;
  }
}

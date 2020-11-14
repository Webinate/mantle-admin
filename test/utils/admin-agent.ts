import Agent from './agent';
import { GET_USER, REMOVE_USER } from '../../src/graphql/requests/user-requests';
import {
  User,
  AddVolumeInput,
  Post,
  Element,
  AddPostInput,
  Category,
  Comment,
  Volume,
  PaginatedCategoryResponse,
  PaginatedFilesResponse,
  PaginatedTemplateResponse,
  UpdatePostInput,
  AddCommentInput,
  UpdateCommentInput,
} from 'mantle';
import { ADD_VOLUME, REMOVE_VOLUME, GET_FILES } from '../../src/graphql/requests/media-requests';
import { ADD_POST, REMOVE_POST, GET_POST, UPDATE_POST } from '../../src/graphql/requests/post-requests';
import { GET_CATEGORIES, GET_CATEGORY, REMOVE_CATEGORY } from '../../src/graphql/requests/category-requests';
import { GetFilesArgs } from '../../../../src/graphql/models/file-type';
import { PATCH_ELEMENT, ADD_ELEMENT, SET_TEMPLATE } from '../../src/graphql/requests/document-requests';
import { UpdateElementInput, AddElementInput } from '../../../../src/graphql/models/element-type';
import { GET_TEMPLATES } from '../../src/graphql/requests/templates-request';
import { ADD_COMMENT, REMOVE_COMMENT, PATCH_COMMENT } from '../../src/graphql/requests/comment-requests';

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

  async getFiles(options: Partial<GetFilesArgs>) {
    const resp = await this.graphql<{ files: PaginatedFilesResponse }>(GET_FILES, { ...options });
    return resp.data.files;
  }

  async removeVolume(id: string) {
    const resp = await this.graphql<{ removeVolume: boolean }>(REMOVE_VOLUME, { id });
    return resp.data.removeVolume;
  }

  async getPost(post: { id?: string; slug?: string }) {
    const resp = await this.graphql<{ post: Post }>(GET_POST, { ...post });
    return resp.data.post;
  }

  async addPost(token: AddPostInput) {
    const resp = await this.graphql<{ createPost: Post }>(ADD_POST, { token });
    return resp.data.createPost;
  }

  async patchPost(token: UpdatePostInput) {
    const resp = await this.graphql<{ patchPost: Post }>(UPDATE_POST, { token });
    return resp.data.patchPost;
  }

  async removePost(id: string) {
    const resp = await this.graphql<{ removePost: Post }>(REMOVE_POST, { id });
    return resp.data.removePost;
  }

  async addComment(token: AddCommentInput) {
    const resp = await this.graphql<{ addComment: Comment }>(ADD_COMMENT, { token });
    return resp.data.addComment;
  }

  async patchComment(token: UpdateCommentInput) {
    const resp = await this.graphql<{ patchComment: Comment }>(PATCH_COMMENT, { token });
    return resp.data.patchComment;
  }

  async removeComment(id: string) {
    const resp = await this.graphql<{ removeComment: boolean }>(REMOVE_COMMENT, { id });
    return resp.data.removeComment;
  }

  async getCategory(cat: { id?: string; slug?: string }) {
    const resp = await this.graphql<{ category: Category }>(GET_CATEGORY, { ...cat });
    return resp.data.category;
  }

  async updateElement(token: UpdateElementInput, docId: string) {
    const resp = await this.graphql<{ updateDocElement: Element }>(PATCH_ELEMENT, { token, docId });
    return resp.data.updateDocElement;
  }

  async addElement(token: AddElementInput, docId: string) {
    const resp = await this.graphql<{ addDocElement: Element }>(ADD_ELEMENT, { token, docId });
    return resp.data.addDocElement;
  }

  async changeTemplate(templateId: string, docId: string) {
    const resp = await this.graphql<{ changeDocTemplate: boolean }>(SET_TEMPLATE, { template: templateId, id: docId });
    return resp.data.changeDocTemplate;
  }

  async getCategories() {
    const resp = await this.graphql<{ categories: PaginatedCategoryResponse }>(GET_CATEGORIES, {});
    return resp.data.categories;
  }

  async removeCategory(id: string) {
    const resp = await this.graphql<{ removeCategory: boolean }>(REMOVE_CATEGORY, { id });
    return resp.data.removeCategory;
  }

  async getTemplates() {
    const resp = await this.graphql<{ templates: PaginatedTemplateResponse }>(GET_TEMPLATES, {});
    return resp.data.templates;
  }
}

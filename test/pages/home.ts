import Page from './page';
import Agent from '../utils/agent';

export default class HomePage extends Page {
  constructor() {
    super();
  }

  async load( agent: Agent ) {
    await super.load();

    if ( agent )
      await this.setAgent( agent );

    await super.to( '/dashboard' );
  }
}
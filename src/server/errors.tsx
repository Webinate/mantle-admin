export class RedirectError extends Error {
  public redirect: string;
  constructor( redirect: string ) {
    super( `Redirecting to ${ redirect }` );
    this.redirect = redirect;
  }
}
import { Action } from 'redux';
import { match } from 'react-router';
import * as Redux from 'react-redux';
import { Request } from 'express';

export type ActionArray = ( Action | Promise<Action> )[];
export type ActionCallback = <P>( matches: match<P>, req: Request ) => ( Action | Promise<Action> )[];
export type RouteAction = {
  path: string;
  exact?: boolean;
  actions: ActionArray | ActionCallback
};

/**
 * An array of route paths and their associated actions.
 * If a route path matches a url, then all actions associated with that RouteAction
 * will be executed before the html is served to the client
 */
export const routeActions: RouteAction[] = [];

/**
 * decorators buggy in TS, so this is necessary to overcome an issue using Redux @connect
 */
export function connectWrapper( mapStateToProps: any, mapDispatchToProps?: any, mergeProps?: any, options?: any ) {
  return ( target: any ) => ( Redux.connect( mapStateToProps, mapDispatchToProps, mergeProps, options )( target ) as any );
}

/**
 * Helper function, which examines & returns the return value of the expression
 * passed in.
 */
export function returntypeof<RT>( expression: ( ...params: any[] ) => RT ): RT {
  return {} as any;
}

/**
 * This decorator populates the application state with data before the client loads.
 * Each RouteAction will execute their actions if the url of the client matches
 * the path. This will in-turn hydrate the application state before its initial render
 */
export function hydrate( ...actions: RouteAction[] ) {
  routeActions.push( ...actions );
  return ( target: any ) => target
}
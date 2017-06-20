import { ActionCreator } from '../actions-creator';
import { IRootState } from '../../store';

// Action Creators
export const ActionCreators = {
  SetCount: new ActionCreator<'SetCount', number>( 'SetCount' ),
  IsBusy: new ActionCreator<'IsBusy', boolean>( 'IsBusy' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Increments the counter
 */
export function increment( amount: number ) {
  return ( dispatch: Function, getState: () => IRootState ) => {
    dispatch( ActionCreators.IsBusy.create( true ) );

    setTimeout( () => {
      const countState = getState().countState;
      dispatch( ActionCreators.SetCount.create( countState.count + amount ) );
    }, 2000 );
  }
}
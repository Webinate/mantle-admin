import * as React from 'react';
import { IRootState } from 'modepress/clients/modepress-admin/src/store';
import { connectWrapper, returntypeof } from 'modepress/clients/modepress-admin/src/utils/decorators';
import { default as styled } from 'modepress/clients/modepress-admin/src/theme/styled';
import ContentHeader from 'modepress/clients/modepress-admin/src/components/content-header';
import { getComments } from '../store/comments/actions';
import FilterBar from 'modepress/clients/modepress-admin/src/components/comments/filter-bar';
import { IComment } from 'modepress';
import { isAdminUser } from '../utils/component-utils';
import { CommentsList } from 'modepress/clients/modepress-admin/src/components/comments/comments-list';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  user: state.authentication.user,
  commentState: state.comments,
  app: state.app,
  location: ownProps.location as Location
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getAll: getComments
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  selectedUids: string[];
  showDeleteModal: boolean;
  filtersOpen: boolean;
};

/**
 * The comments container
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Comments extends React.Component<Props, State> {
  private _selected: IComment<'client'> | null;

  constructor( props: Props ) {
    super( props );
    this._selected = null;
    this.state = {
      selectedUids: [],
      showDeleteModal: false,
      filtersOpen: false
    };
  }

  private onSearch( term: string ) {
    this.props.getAll( { index: 0, keyword: term } );
  }

  private onDeleteMultiple() {
    this._selected = null;
    this.setState( {
      showDeleteModal: true
    } );

    this._selected;
  }

  render() {
    const page = this.props.commentState.commentPage;
    const isBusy = this.props.commentState.busy;
    const isAdmin = isAdminUser( this.props.user );

    return (
      <div>
        <ContentHeader
          title="Comments"
          busy={isBusy}
          renderFilters={() => <FilterBar
            onSearch={term => this.onSearch( term )}
            commentsSelected={this.state.selectedUids.length > 0 ? false : true}
            onDelete={() => this.onDeleteMultiple()}
            isAdminUser={isAdmin ? false : true}
            onFilterToggle={val => this.setState( { filtersOpen: val } )}
            filtersOpen={this.state.filtersOpen}
          />}
        >
        </ContentHeader>
        <Container>
          <CommentsList
            getAll={options => this.props.getAll( options )}
            onCommentsSelected={uids => this.setState( { selectedUids: uids } )}
            loading={isBusy}
            page={page}
          />
        </Container>
      </div>
    );
  }
}

const Container = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;
`;
import * as React from 'react';
import { default as styled } from '../theme/styled';
import { Checkbox, FlatButton, TextField, MenuItem, SelectField, RaisedButton, Dialog, CircularProgress, IconButton } from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/remove';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import EditIcon from 'material-ui/svg-icons/image/edit';
import theme from '../theme/mui-theme';
import { ICategory } from 'modepress';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { IRootState } from '../store';
import { createCategory, editCategory, removeCategory, getCategories, ActionCreators } from '../store/categories/actions';

export type ExternalProps = {
  selected: string[];
  onCategorySelected: ( category: ICategory<'client'> ) => void;
}

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: ExternalProps ) => ( {
  categories: state.categories,
  selected: ownProps.selected,
  onCategorySelected: ownProps.onCategorySelected,
  app: state.app
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  createCategory,
  editCategory,
  removeCategory,
  getCategories,
  setError: ActionCreators.SetCategoryErr.create
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  addCategoryMode: boolean;
  deleteMode: boolean;
  editMode: boolean;
  newCategory: Partial<ICategory<'client'>>;
  autoSlug: string;
  pristineForm: boolean;
  selectedCategory: ICategory<'client'> | null;
}

@connectWrapper( mapStateToProps, dispatchToProps )
export class CategoryEditor extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      addCategoryMode: false,
      deleteMode: false,
      editMode: false,
      newCategory: {},
      autoSlug: '',
      pristineForm: true,
      selectedCategory: null
    }
  }

  private getCleanSlugText( text: string ) {
    let cleanValue = text.replace( /\s+/g, '-' );
    cleanValue = cleanValue.replace( /[^a-zA-Z0-9 -]/g, '' ).toLowerCase();
    return cleanValue;
  }

  private expandCategory( c: ICategory<'client'>, flatCategories: ICategory<'client'>[] ) {
    flatCategories.push( c );
    for ( const child of c.children )
      this.expandCategory( child as ICategory<'client'>, flatCategories );
  }

  private renderNewCategoryForm( categories: ICategory<'client'>[] ) {
    const isLoading = this.props.categories.busy;
    const flatCategories: ICategory<'client'>[] = [];
    for ( const c of categories )
      this.expandCategory( c, flatCategories );

    return (
      <div className="mt-category-form">
        <TextField
          id="mt-new-cat-name"
          autoFocus={true}
          floatingLabelText="Category name"
          value={this.state.newCategory.title}
          fullWidth={true}
          onChange={( e, text ) => {
            this.setState( {
              newCategory: { ...this.state.newCategory, title: text },
              autoSlug: this.getCleanSlugText( text )
            } );
          }}
        />
        <TextField
          id="mt-new-cat-slug"
          floatingLabelText="Category short code"
          value={this.state.newCategory.slug || this.state.autoSlug}
          fullWidth={true}
          onChange={( e, text ) => {
            const slug = this.getCleanSlugText( text );
            this.setState( { newCategory: { ...this.state.newCategory, slug: slug } } );
          }}
        />
        <TextField
          id="mt-new-cat-desc"
          floatingLabelText="Optional category description"
          value={this.state.newCategory.description}
          fullWidth={true}
          onChange={( e, text ) => { this.setState( { newCategory: { ...this.state.newCategory, description: text } } ) }}
        />
        <SelectField
          id="mt-new-cat-parent"
          floatingLabelText="Optional parent category"
          value={this.state.newCategory.parent || ''}
          dropDownMenuProps={{
            animated: this.props.app.debugMode ? false : true
          }}
          fullWidth={true}
          onChange={( e, index, value ) => {
            this.setState( { newCategory: { ...this.state.newCategory, parent: value } }
            )
          }}
        >
          <MenuItem
            value={''}
            primaryText={''}
          />
          {flatCategories.map( ( parent, parentIndex ) => {
            return <MenuItem
              key={`parent-${ parentIndex }`}
              value={parent._id}
              primaryText={parent.title}
            />
          } )}

        </SelectField>
        <div className="mt-newcat-error">
          {this.props.categories.error}
        </div>
        <div style={{ display: 'flex', margin: '20px 0 0 0' }}>
          <FlatButton
            disabled={isLoading}
            className="mt-cancel-category-form"
            style={{
              verticalAlign: 'middle',
              margin: '0 4px 0 0',
              flex: '1'
            }}
            onClick={e => {
              this.setState( { addCategoryMode: false } );
              this.props.setError( null );
            }}
            label="Cancel"
          />
          <RaisedButton
            disabled={isLoading}
            className="mt-approve-category-form"
            primary={true}
            style={{
              verticalAlign: 'middle',
              flex: '1'
            }}
            icon={<AddIcon />}
            onClick={e => {
              if ( this.state.newCategory._id ) {
                this.props.editCategory( {
                  ...this.state.newCategory,
                  slug: this.state.newCategory.slug || this.state.autoSlug
                }, () => {
                  this.setState( {
                    addCategoryMode: false
                  } )
                } )
              }
              else {
                this.props.createCategory( {
                  ...this.state.newCategory,
                  slug: this.state.newCategory.slug || this.state.autoSlug
                }, () => {
                  this.setState( {
                    addCategoryMode: false
                  } )
                } )
              }
            }}
            label={this.state.newCategory._id ? 'Edit' : 'Add'}
          />
        </div>
      </div>
    );
  }

  private onConfirmDelete() {
    this.props.removeCategory( this.state.selectedCategory! );
    this.setState( { selectedCategory: null } );

    const categories = this.props.categories.categoryPage ? this.props.categories.categoryPage.data : [];
    if ( categories.length === 1 && this.state.deleteMode )
      this.setState( { deleteMode: false } )
  }

  private renderCategory( cat: ICategory<'client'>, catIndex: number ): JSX.Element {
    const selected = this.props.selected.find( i => i === cat._id ) ? true : false;

    return (
      <div key={`category-${ catIndex }`} className="mt-category-item-container">
        <Checkbox
          className={`mt-category-checkbox ${ selected ? 'selected' : '' }`}
          id={`mt-cat-${ cat._id }`}
          iconStyle={{
            fill: this.state.deleteMode || this.state.editMode ? theme.primary200.background : theme.primary300.background
          }}
          onClick={e => {
            if ( this.state.deleteMode )
              this.setState( { selectedCategory: cat } );
            else if ( this.state.editMode )
              this.setState( {
                selectedCategory: cat,
                editMode: false,
                addCategoryMode: true,
                newCategory: { ...cat }
              } );
            else
              this.props.onCategorySelected( cat );
          }}
          uncheckedIcon={this.state.deleteMode ? <DeleteIcon /> : this.state.editMode ? <EditIcon /> : undefined}
          checkedIcon={this.state.deleteMode ? <DeleteIcon /> : this.state.editMode ? <EditIcon /> : undefined}
          key={`category-${ catIndex }`}
          label={cat.title}
          checked={selected}
        />
        <CategoryChildren>
          {cat.children.map( ( child, subIndex ) => this.renderCategory( child as ICategory<'client'>, subIndex ) )}
        </CategoryChildren>
      </div>
    );
  }

  private renderAllCategories( categories: ICategory<'client'>[] ) {
    return (
      <div>
        <ActiveCategories className="mt-category-root">
          {
            categories.map( ( c, catIndex ) => {
              return this.renderCategory( c, catIndex );
            } )}
        </ActiveCategories>


        {this.state.deleteMode || this.state.editMode ?
          <CategoryButtons>
            <FlatButton
              primary={true}
              className="mt-cancel-category-delete"
              onClick={e => {
                this.setState( { deleteMode: false, editMode: false } );
              }}
              style={{ display: 'block' }}
              label="Cancel"
            />
          </CategoryButtons> :
          <CategoryButtons>
            <FlatButton
              primary={true}
              className="mt-new-category-btn"
              icon={<AddIcon />}
              onClick={e => this.setState( {
                addCategoryMode: true,
                pristineForm: true,
                newCategory: {},
                autoSlug: '',
              } )}
              style={{ display: 'block' }}
              label="Add Category"
            />

            {categories.length > 0 ?
              <FlatButton
                className="mt-remove-category-btn"
                primary={true}
                icon={<RemoveIcon />}
                onClick={e => this.setState( {
                  deleteMode: true
                } )}
                style={{ display: 'block' }}
                label="Remove Category"
              /> : undefined}
          </CategoryButtons>
        }
      </div>
    );
  }

  render() {
    const categories: ICategory<'client'>[] = this.props.categories.categoryPage ? this.props.categories.categoryPage.data : [];
    return (
      <Container className="mt-category-container">
        <CategoriesHeader>
          <div>
            <h3>{this.state.addCategoryMode ? this.state.newCategory._id ? 'Edit Category' : 'New Category' : 'Categories'}</h3>
          </div>
          <div>
            {this.props.categories.busy ? <span
              className="mt-cat-loading"
            >
              <CircularProgress size={20} />
            </span> : !this.state.addCategoryMode && !this.state.deleteMode && categories.length > 0 && !this.state.editMode ?
                <IconButton
                  className="mt-edit-cat-btn"
                  onClick={e => this.setState( { editMode: true } )}
                  style={{ padding: 0, height: 25, width: 25 }}
                  iconStyle={{ padding: 0, height: 25, width: 25 }}
                >
                  <EditIcon />
                </IconButton>
                : undefined}
          </div>

        </CategoriesHeader>

        <div>
          {this.state.addCategoryMode ?
            this.renderNewCategoryForm( categories ) : this.renderAllCategories( categories )}
        </div>
        {
          this.state.selectedCategory && this.state.deleteMode ?
            <Dialog
              contentClassName="mt-category-del-container"
              open={true}
              actions={[
                <FlatButton
                  label="Cancel"
                  style={{ margin: '0 5px 0 0', verticalAlign: 'middle' }}
                  className="mt-cancel-delcat"
                  onClick={e => this.setState( {
                    selectedCategory: null,
                    deleteMode: false
                  } )}
                />,
                <RaisedButton
                  label="Yes"
                  primary={true}
                  style={{ verticalAlign: 'middle' }}
                  className="mt-confirm-delcat"
                  onClick={e => this.onConfirmDelete()}
                />
              ]}
            >
              Are you sure you want to delete the category '{this.state.selectedCategory.title}'
        </Dialog> : undefined
        }
      </Container >
    );
  }
}

const CategoriesHeader = styled.div`
  display: flex;
  > div {
    flex: 1;
  }

  > div:last-child {
    text-align: right;
  }

  h3 {
    margin: 0;
  }
`;

const Container = styled.div`
  > h3 {
    margin: 0;
  }

  .mt-newcat-error {
    margin: 6px 0;
    color: ${theme.error.background }
  }
`;

const CategoryChildren = styled.div`
padding: 0 0 0 5px;
`;

const ActiveCategories = styled.div`
  padding: 10px 0 0 0;
`;

const CategoryButtons = styled.div`
  margin: 10px 0 0 0;
`;

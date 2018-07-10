import * as React from 'react';
import { default as styled } from '../theme/styled';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
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
          label="Category name"
          value={this.state.newCategory.title}
          fullWidth={true}
          onChange={( e ) => {
            this.setState( {
              newCategory: { ...this.state.newCategory, title: e.currentTarget.value },
              autoSlug: this.getCleanSlugText( e.currentTarget.value )
            } );
          }}
        />
        <TextField
          id="mt-new-cat-slug"
          label="Category short code"
          value={this.state.newCategory.slug || this.state.autoSlug}
          fullWidth={true}
          onChange={( e ) => {
            const slug = this.getCleanSlugText( e.currentTarget.value );
            this.setState( { newCategory: { ...this.state.newCategory, slug: slug } } );
          }}
        />
        <TextField
          id="mt-new-cat-desc"
          label="Optional category description"
          value={this.state.newCategory.description}
          fullWidth={true}
          onChange={( e ) => { this.setState( { newCategory: { ...this.state.newCategory, description: e.currentTarget.value } } ) }}
        />

        <FormControl
          fullWidth={true}
        >
          <InputLabel htmlFor="mt-new-cat-parent">Age</InputLabel>
          <Select
            MenuProps={{ transitionDuration: this.props.app.debugMode ? 0 : 'auto' }}
            value={this.state.newCategory.parent || ''}
            onChange={e => this.setState( { newCategory: { ...this.state.newCategory, parent: e.target.value } } )}
            input={<Input id="mt-new-cat-parent" />}
          >
            <MenuItem
              value={''}
            >None</MenuItem>
            {flatCategories.map( ( parent, parentIndex ) => {
              return <MenuItem
                key={`parent-${ parentIndex }`}
                value={parent._id}
              >{parent.title}</MenuItem>
            } )}
          </Select>
          <FormHelperText>Optional parent category</FormHelperText>
        </FormControl>

        <div className="mt-newcat-error">
          {this.props.categories.error}
        </div>
        <div style={{ display: 'flex', margin: '20px 0 0 0' }}>
          <Button
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
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isLoading}
            className="mt-approve-category-form"
            color="primary"
            style={{
              verticalAlign: 'middle',
              flex: '1'
            }}
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
          > <AddIcon style={{ margin: '0 5px 0 0' }} />
            {this.state.newCategory._id ? 'Edit' : 'Add'}
          </Button>
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

    const checkboxStyle: React.CSSProperties = {
      fill: this.state.deleteMode || this.state.editMode ? theme.primary200.background : theme.primary300.background
    };

    return (
      <div key={`category-${ catIndex }`} className="mt-category-item-container">
        <FormControlLabel
          key={`category-${ catIndex }`}
          control={
            <Checkbox
              checked={selected}
              color="primary"
              className={`mt-category-checkbox ${ selected ? 'selected' : '' }`}
              id={`mt-cat-${ cat._id }`}
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
              icon={this.state.deleteMode ? <DeleteIcon style={checkboxStyle} /> : this.state.editMode ? <EditIcon style={checkboxStyle} /> : undefined}
              checkedIcon={this.state.deleteMode ? <DeleteIcon style={checkboxStyle} /> : this.state.editMode ? <EditIcon style={checkboxStyle} /> : undefined}
              value="checked"
            />
          }
          label={cat.title}
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
            <Button
              variant="contained"
              color="primary"
              className="mt-cancel-category-delete"
              onClick={e => {
                this.setState( { deleteMode: false, editMode: false } );
              }}
              style={{ display: 'block' }}
            >Cancel</Button>
          </CategoryButtons> :
          <CategoryButtons>
            <Button
              className="mt-new-category-btn"
              onClick={e => this.setState( {
                addCategoryMode: true,
                pristineForm: true,
                newCategory: {},
                autoSlug: '',
              } )}
            >
              <AddIcon style={{ margin: '0 5px 0 0' }} />
              Add Category
            </Button>

            {categories.length > 0 ?
              <Button
                className="mt-remove-category-btn"
                onClick={e => this.setState( {
                  deleteMode: true
                } )}
              >
                <RemoveIcon style={{ margin: '0 5px 0 0' }} />
                Remove Category
              </Button> : undefined}
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
                  style={{ padding: 0, position: 'absolute', top: '-5px', right: 0 }}
                >
                  <EditIcon style={{ padding: 0 }} />
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
              open={true}
            >
              <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
              <DialogContent className="mt-category-del-container">
                <DialogContentText>
                  Are you sure you want to delete the category '{this.state.selectedCategory.title}'
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Email Address"
                  type="email"
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button
                  style={{ margin: '0 5px 0 0', verticalAlign: 'middle' }}
                  className="mt-cancel-delcat"
                  onClick={e => this.setState( {
                    selectedCategory: null,
                    deleteMode: false
                  } )}
                >Cancel</Button>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ verticalAlign: 'middle' }}
                  className="mt-confirm-delcat"
                  onClick={e => this.onConfirmDelete()}
                >Yes</Button>
              </DialogActions>

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
    position: relative;
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

  .mt-category-form > div {
    margin: 5px 0 5px 0;
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

import * as React from 'react';
import { State as CategoryState } from '../store/categories/reducer';
import { default as styled } from '../theme/styled';
import { Checkbox, FlatButton, TextField, MenuItem, SelectField, RaisedButton } from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/remove';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import theme from '../theme/mui-theme';
import { ICategory } from 'modepress';

export type Props = {
  onCategoryAdded: ( category: ICategory, onComplete?: () => void ) => void;
  onCategoryRemoved: ( category: ICategory ) => void;
  categories: CategoryState;
  selected: string[];
}

export type State = {
  addCategoryMode: boolean;
  deleteMode: boolean;
  newCategory: Partial<ICategory>;
}

export class CategoryEditor extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      addCategoryMode: false,
      deleteMode: false,
      newCategory: {}
    }
  }

  renderNewCategoryForm( categories: ICategory[] ) {
    const isLoading = this.props.categories.busy;

    return (
      <div>
        <TextField
          id="mt-new-cat-name"
          autoFocus={true}
          floatingLabelText="Category name"
          value={this.state.newCategory.title}
          fullWidth={true}
          onChange={( e, text ) => { this.setState( { newCategory: { ...this.state.newCategory, title: text } } ) }}
        />
        <TextField
          id="mt-new-cat-slug"
          floatingLabelText="Category short code"
          value={this.state.newCategory.slug}
          fullWidth={true}
          onChange={( e, text ) => { this.setState( { newCategory: { ...this.state.newCategory, slug: text } } ) }}
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
          {categories.map( ( parent, parentIndex ) => {
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
            style={{
              verticalAlign: 'middle',
              margin: '0 4px 0 0',
              flex: '1'
            }}
            onClick={e => this.setState( {
              addCategoryMode: false
            } )}
            label="Cancel"
          />
          <RaisedButton
            disabled={isLoading}
            primary={true}
            style={{
              verticalAlign: 'middle',
              flex: '1'
            }}
            icon={<AddIcon />}
            onClick={e => {
              this.props.onCategoryAdded( this.state.newCategory, () => {
                this.setState( {
                  addCategoryMode: false
                } )
              } )
            }}
            label="Add"
          />
        </div>
      </div>
    );
  }

  renderAllCategories( categories: ICategory[] ) {
    return (
      <div>
        <ActiveCategories>
          {categories.map( ( c, catIndex ) => {
            return <Checkbox
              iconStyle={{ fill: this.state.deleteMode ? theme.primary200.background : theme.primary300.background }}
              onClick={e => {
                if ( categories.length === 1 )
                  this.setState( { deleteMode: false } )

                if ( this.state.deleteMode )
                  this.props.onCategoryRemoved( c );
              }}
              uncheckedIcon={this.state.deleteMode ? <DeleteIcon /> : undefined}
              checkedIcon={this.state.deleteMode ? <DeleteIcon /> : undefined}
              key={`category-${ catIndex }`}
              label={c.title}
              checked={this.props.selected.find( i => i === c._id ) ? true : false}
            />
          } )}
        </ActiveCategories>


        {this.state.deleteMode ?
          <CategoryButtons>
            <FlatButton
              primary={true}
              onClick={e => this.setState( {
                deleteMode: false
              } )}
              style={{ display: 'block' }}
              label="Cancel"
            />
          </CategoryButtons> :
          <CategoryButtons>
            <FlatButton
              primary={true}
              icon={<AddIcon />}
              onClick={e => this.setState( {
                addCategoryMode: true,
                newCategory: {}
              } )}
              style={{ display: 'block' }}
              label="Add Category"
            />

            {categories.length > 0 ?
              <FlatButton
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
    const categories = this.props.categories.categoryPage ? this.props.categories.categoryPage.data : [];
    return (
      <Container>
        <h3>{this.state.addCategoryMode ? 'New Category' : 'Categories'}</h3>
        <div>
          {this.state.addCategoryMode ?
            this.renderNewCategoryForm( categories ) : this.renderAllCategories( categories )}
        </div>
      </Container>
    );
  }
}

const Container = styled.div`
  > h3 {
    margin: 0;
  }

  > div {
    margin: 8px 0 0 0;
  }

  .mt-newcat-error {
    margin: 6px 0;
    color: ${theme.error.background }
  }
`;

const ActiveCategories = styled.div`
  padding: 10px 0 0 0;
`;

const CategoryButtons = styled.div`
  margin: 10px 0 0 0;
`;

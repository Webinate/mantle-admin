import * as React from 'react';
import { State as CategoryState } from '../store/categories/reducer';
import { default as styled } from '../theme/styled';
import { Checkbox, FlatButton, TextField, MenuItem, SelectField, Dialog, RaisedButton } from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/remove';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { ICategory } from 'modepress';

export type Props = {
  onCategoryAdded: ( category: ICategory ) => void;
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

  render() {
    const categories = this.props.categories.categoryPage ? this.props.categories.categoryPage.data : [];
    return <div>
      <ActiveCategories>
        {categories.map( ( c, catIndex ) => {
          return <Checkbox
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
      <Dialog
        title="New Category"
        onRequestClose={e => this.setState( { addCategoryMode: false } )}
        open={this.state.addCategoryMode}
        actions={[
          <FlatButton
            style={{ verticalAlign: 'middle', margin: '0 4px 0 0' }}
            onClick={e => this.setState( {
              addCategoryMode: false
            } )}
            label="Cancel"
          />,
          <RaisedButton
            primary={true}
            style={{ verticalAlign: 'middle' }}
            icon={<AddIcon />}
            onClick={e => {
              this.setState( {
                addCategoryMode: false
              } );
              this.props.onCategoryAdded( this.state.newCategory )
            }}
            label="New Category"
          /> ]}
        actionsContainerStyle={{
          padding: '0 20px 20px 20px'
        }}
        contentStyle={{
          width: '350px'
        }}
      >
        <NewCategories>
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
        </NewCategories>
      </Dialog>

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

          <FlatButton
            primary={true}
            icon={<RemoveIcon />}
            onClick={e => this.setState( {
              deleteMode: true
            } )}
            style={{ display: 'block' }}
            label="Remove Category"
          />
        </CategoryButtons>
      }
    </div>
  }
}

const ActiveCategories = styled.div`
  padding: 10px 0 0 0;
`;

const NewCategories = styled.div`
`;

const CategoryButtons = styled.div`
  margin: 10px 0 0 0;
`;

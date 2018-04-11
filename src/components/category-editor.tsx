import * as React from 'react';
import { default as styled } from '../theme/styled';
import { Checkbox, FlatButton, TextField, MenuItem, SelectField, Dialog, RaisedButton } from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import { ICategory } from 'modepress';

export type Props = {
  onCategoryAdded: ( category: ICategory ) => void;
  onCategoryRemoved: ( category: ICategory ) => void;
  categories: ICategory[];
  selected: string[];
}

export type State = {
  addCategoryMode: boolean;
  newCategory: Partial<ICategory>;
}

export class CategoryEditor extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      addCategoryMode: false,
      newCategory: {}
    }
  }

  render() {
    return <div>
      <ActiveCategories>
        {this.props.categories.map( ( c, catIndex ) => {
          return <Checkbox
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
            {this.props.categories.map( ( parent, parentIndex ) => {
              return <MenuItem
                key={`parent-${ parentIndex }`}
                value={parent._id}
                primaryText={parent.title}
              />
            } )}

          </SelectField>
        </NewCategories>
      </Dialog>

      <CategoryButtons>
        <FlatButton
          primary={true}
          icon={<AddIcon />}
          onClick={e => this.setState( {
            addCategoryMode: true,
            newCategory: {}
          } )}
          label="Add new Category"
        />
      </CategoryButtons>
    </div>
  }
}

const ActiveCategories = styled.div`
`;

const NewCategories = styled.div`
`;

const CategoryButtons = styled.div`
`;

import * as React from 'react';
import { default as styled } from '../theme/styled';
import { Checkbox, FlatButton, TextField, MenuItem, SelectField } from 'material-ui';
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
      {!this.state.addCategoryMode ?
        <ActiveCategories>
          {this.props.categories.map( ( c, catIndex ) => {
            return <Checkbox
              key={`category-${ catIndex }`}
              label={c.title}
              checked={this.props.selected.find( i => i === c._id ) ? true : false}
            />
          } )}
        </ActiveCategories> :
        <NewCategories>
          <TextField
            floatingLabelText="Category name"
            value={this.state.newCategory.title}
            onChange={( e, text ) => { this.setState( { newCategory: { ...this.state.newCategory, title: text } } ) }}
          />
          <TextField
            floatingLabelText="Category short code"
            value={this.state.newCategory.slug}
            onChange={( e, text ) => { this.setState( { newCategory: { ...this.state.newCategory, slug: text } } ) }}
          />
          <TextField
            floatingLabelText="Optional category description"
            value={this.state.newCategory.description}
            onChange={( e, text ) => { this.setState( { newCategory: { ...this.state.newCategory, description: text } } ) }}
          />
          <SelectField
            floatingLabelText="Optional parent category"
            value={this.state.newCategory.parent || ''}
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
      }
      {this.state.addCategoryMode ?
        <CategoryButtons>
          <FlatButton
            onClick={e => this.setState( {
              addCategoryMode: false
            } )}
            label="Cancel"
          />

          <FlatButton
            onClick={e => {
              this.setState( {
                addCategoryMode: false
              } );
              this.props.onCategoryAdded( this.state.newCategory )
            }}
            label="Add"
          />

        </CategoryButtons> :
        <CategoryButtons>
          <FlatButton
            onClick={e => this.setState( {
              addCategoryMode: true,
              newCategory: {}
            } )}
            label="Add new Category"
          />
        </CategoryButtons>}
    </div>
  }
}

const ActiveCategories = styled.div`
`;

const NewCategories = styled.div`
`;

const CategoryButtons = styled.div`
`;

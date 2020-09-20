import * as React from 'react';
import { useState } from 'react';
import { default as styled } from '../theme/styled';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Checkbox from '@material-ui/core/Checkbox';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import theme from '../theme/mui-theme';
import { Category, UpdateCategoryInput } from 'mantle';
import { IRootState } from '../store';
import categoryActions, { ActionCreators } from '../store/categories/actions';
import { useDispatch, useSelector } from 'react-redux';

import { State as AppState } from '../store/app/reducer';
import { State as CategoriesState } from '../store/categories/reducer';

export type Props = {
  selected: string[];
  onCategorySelected: (category: Category) => void;
};

// Map state to props
const CategoryEditor: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const [addCategoryMode, setAddCategoryMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<UpdateCategoryInput>>({});
  const [autoSlug, setAutoSlug] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const app = useSelector<IRootState, AppState>((state) => state.app);
  const categories = useSelector<IRootState, CategoriesState>((state) => state.categories);

  const getCleanSlugText = (text: string) => {
    let cleanValue = text.replace(/\s+/g, '-');
    cleanValue = cleanValue.replace(/[^a-zA-Z0-9 -]/g, '').toLowerCase();
    return cleanValue;
  };

  const expandCategory = (c: Category, flatCategories: Category[]) => {
    flatCategories.push(c);
    if (c.children) for (const child of c.children) expandCategory(child, flatCategories);
  };

  const renderNewCategoryForm = (categoriesArr: Category[]) => {
    const isLoading = categories.busy;
    const flatCategories: Category[] = [];
    for (const c of categoriesArr) expandCategory(c, flatCategories);

    return (
      <div className="mt-category-form">
        <TextField
          id="mt-new-cat-name"
          autoFocus={true}
          label="Category name"
          value={newCategory.title}
          fullWidth={true}
          onChange={(e) => {
            setNewCategory({ ...newCategory, title: e.currentTarget.value });
            setAutoSlug(getCleanSlugText(e.currentTarget.value));
          }}
        />
        <TextField
          id="mt-new-cat-slug"
          label="Category short code"
          value={newCategory.slug || autoSlug}
          fullWidth={true}
          onChange={(e) => {
            const slug = getCleanSlugText(e.currentTarget.value);
            setNewCategory({ ...newCategory, slug: slug });
          }}
        />
        <TextField
          id="mt-new-cat-desc"
          label="Optional category description"
          value={newCategory.description || ''}
          fullWidth={true}
          onChange={(e) => {
            setNewCategory({ ...newCategory, description: e.currentTarget.value });
          }}
        />

        <FormControl fullWidth={true} className="mt-new-cat-parent">
          <InputLabel htmlFor="mt-new-cat-parent-input">Parent Category</InputLabel>
          <Select
            MenuProps={{ transitionDuration: app.debugMode ? 0 : 'auto' }}
            value={(newCategory.parent as string) || ''}
            onChange={(e) => setNewCategory({ ...newCategory, parent: e.target.value })}
            input={<Input id="mt-new-cat-parent-input" />}
          >
            <MenuItem className="mt-cat-parent-item" value={''}>
              None
            </MenuItem>
            {flatCategories.map((parent, parentIndex) => {
              return (
                <MenuItem className="mt-cat-parent-item" key={`parent-${parentIndex}`} value={parent._id as string}>
                  {parent.title}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <div className="mt-newcat-error">{categories.error}</div>
        <div style={{ display: 'flex', margin: '20px 0 0 0' }}>
          <Button
            disabled={isLoading}
            className="mt-cancel-category-form"
            style={{
              verticalAlign: 'middle',
              margin: '0 4px 0 0',
              flex: '1',
            }}
            onClick={(e) => {
              setAddCategoryMode(false);
              dispatch(ActionCreators.SetCategoryErr.create(null));
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
              flex: '1',
            }}
            onClick={(e) => {
              if (newCategory._id) {
                dispatch(
                  categoryActions.editCategory(
                    {
                      ...newCategory,
                      slug: newCategory.slug || autoSlug,
                    },
                    () => {
                      setAddCategoryMode(false);
                    }
                  )
                );
              } else {
                dispatch(
                  categoryActions.createCategory(
                    {
                      ...newCategory,
                      slug: newCategory.slug || autoSlug,
                    },
                    () => {
                      setAddCategoryMode(false);
                    }
                  )
                );
              }
            }}
          >
            {' '}
            <AddIcon style={{ margin: '0 5px 0 0' }} />
            {newCategory._id ? 'Edit' : 'Add'}
          </Button>
        </div>
      </div>
    );
  };

  const onConfirmDelete = () => {
    dispatch(categoryActions.removeCategory(selectedCategory!));
    setSelectedCategory(null);

    const categoriesArr = categories.categoryPage ? categories.categoryPage.data : [];
    if (categoriesArr.length === 1 && deleteMode) setDeleteMode(false);
  };

  const renderCategory = (cat: Category, catIndex: number): JSX.Element => {
    const selected = props.selected.find((i) => i === cat._id) ? true : false;

    const checkboxStyle: React.CSSProperties = {
      height: '36px',
      width: '36px',
    };

    const checkboxIconStyle: React.CSSProperties = {
      fill: theme.primary200.background,
      height: '26px',
      width: '26px',
    };

    return (
      <div key={`category-${catIndex}`} className="mt-category-item-container">
        <FormControlLabel
          style={{ marginLeft: '-7px' }}
          key={`category-${catIndex}`}
          className={`mt-category-checkbox ${selected ? 'selected' : ''}`}
          control={
            <Checkbox
              checked={selected}
              color="primary"
              id={`mt-cat-${cat._id}`}
              onClick={(e) => {
                if (deleteMode) setSelectedCategory(cat);
                else if (editMode) {
                  setEditMode(false);
                  setSelectedCategory(cat);
                  setAddCategoryMode(true);
                  setNewCategory({
                    _id: cat._id,
                    description: cat.description,
                    parent: cat.parent ? cat.parent._id : '',
                    slug: cat.slug,
                    title: cat.title,
                  });
                } else props.onCategorySelected(cat);
              }}
              style={checkboxStyle}
              icon={
                deleteMode ? (
                  <DeleteIcon style={checkboxIconStyle} />
                ) : editMode ? (
                  <EditIcon style={checkboxIconStyle} />
                ) : (
                  <CheckBoxOutlineBlankIcon style={checkboxIconStyle} />
                )
              }
              checkedIcon={
                deleteMode ? (
                  <DeleteIcon style={checkboxIconStyle} />
                ) : editMode ? (
                  <EditIcon style={checkboxIconStyle} />
                ) : (
                  <CheckBoxIcon style={checkboxIconStyle} />
                )
              }
              value="checked"
            />
          }
          label={<span className="mt-category-checkbox-label">{cat.title}</span>}
        />

        <CategoryChildren>
          {cat.children && cat.children.map((child, subIndex) => renderCategory(child, subIndex))}
        </CategoryChildren>
      </div>
    );
  };

  const renderAllCategories = (categories: Category[]) => {
    return (
      <div>
        <ActiveCategories className="mt-category-root">
          {categories.map((c, catIndex) => {
            return renderCategory(c, catIndex);
          })}
        </ActiveCategories>

        {deleteMode || editMode ? (
          <CategoryButtons>
            <Button
              variant="contained"
              color="primary"
              className="mt-cancel-category-delete"
              onClick={(e) => {
                setDeleteMode(false);
                setEditMode(false);
              }}
              style={{ display: 'block' }}
            >
              Cancel
            </Button>
          </CategoryButtons>
        ) : (
          <CategoryButtons>
            {!addCategoryMode && !deleteMode && categories.length > 0 && !editMode ? (
              <Button className="mt-edit-cat-btn" onClick={(e) => setEditMode(true)}>
                <EditIcon
                  style={{
                    color: theme.primary200.background,
                    margin: '0 5px 0 0',
                    fontSize: '20px',
                  }}
                />
                Edit Categories
              </Button>
            ) : undefined}

            <Button
              className="mt-new-category-btn"
              onClick={(e) => {
                setAddCategoryMode(true);
                setNewCategory({});
                setAutoSlug('');
              }}
            >
              <AddIcon
                style={{
                  color: theme.primary200.background,
                  margin: '0 5px 0 0',
                }}
              />
              Add Category
            </Button>

            {categories.length > 0 ? (
              <Button
                className="mt-remove-category-btn"
                onClick={(e) => {
                  setDeleteMode(true);
                }}
              >
                <RemoveIcon
                  style={{
                    color: theme.primary200.background,
                    margin: '0 5px 0 0',
                  }}
                />
                Remove Category
              </Button>
            ) : undefined}
          </CategoryButtons>
        )}
      </div>
    );
  };

  const categoriesArr = categories.categoryPage ? categories.categoryPage.data : [];
  return (
    <Container className="mt-category-container">
      <div>{addCategoryMode ? renderNewCategoryForm(categoriesArr) : renderAllCategories(categoriesArr)}</div>
      {selectedCategory && deleteMode ? (
        <Dialog open={true}>
          <DialogTitle id="form-dialog-title">Delete Category?</DialogTitle>
          <DialogContent className="mt-category-del-container">
            <DialogContentText>
              Are you sure you want to delete the category '{selectedCategory.title}'
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              style={{ margin: '0 5px 0 0', verticalAlign: 'middle' }}
              className="mt-cancel-delcat"
              onClick={(e) => {
                setSelectedCategory(null);
                setDeleteMode(false);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              style={{ verticalAlign: 'middle' }}
              className="mt-confirm-delcat"
              onClick={(e) => onConfirmDelete()}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      ) : undefined}
    </Container>
  );
};

export default CategoryEditor;

const Container = styled.div`
  > h3 {
    margin: 0;
  }

  .mt-category-form > div {
    margin: 5px 0 5px 0;
  }

  .mt-newcat-error {
    margin: 6px 0;
    color: ${theme.error.background};
  }
`;

const CategoryChildren = styled.div`
  padding: 0 0 0 5px;
`;

const ActiveCategories = styled.div``;

const CategoryButtons = styled.div`
  margin: 10px 0 0 0;
`;

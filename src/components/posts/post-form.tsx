import * as React from 'react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Icon from '@material-ui/core/Icon';
import RemoveIcon from '@material-ui/icons/Delete';
import { Post, User, File, Element, UpdatePostInput, AddPostInput, AddElementInput, UpdateElementInput } from 'mantle';
import { State as TemplateState } from '../../store/templates/reducer';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import SlugEditor from '../slug-editor';
import UserPicker from '../user-picker';
import CategoryEditor from '../../containers/category-editor';
import FormControl from '@material-ui/core/FormControl';
import MediaModal from '../../containers/media-modal';
import Tooltip from '@material-ui/core/Tooltip';
import { ElmEditor } from './elm-editor';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';

import { DatePicker } from '@material-ui/pickers';
import ImageEditor from './element-editors/image-editor';

export type Props = {
  activeUser: User;
  isAdmin: boolean;
  id?: string;
  post: Partial<Post>;
  elements: Element[];
  templates: TemplateState;
  categoriesLoading: boolean;
  animated: boolean;
  selectedElements: string[];
  focussedId: string;
  onRequestPreview: () => void;
  onUpdate?: (post: Partial<UpdatePostInput>) => void;
  onCreate?: (post: Partial<AddPostInput>) => void;
  renderAfterForm?: () => undefined | null | JSX.Element;
  onTemplateChanged: (templateId: string) => void;
  onCreateElm: (elms: Partial<AddElementInput>[], index?: number) => void;
  onUpdateElm: (
    token: Partial<UpdateElementInput>,
    createElement: Partial<AddElementInput> | null,
    deselect: 'select' | 'deselect' | 'none'
  ) => void;
  onDeleteElements: (ids: string[]) => void;
  onSelectionChanged: (ids: string[], focus: boolean) => void;
};

const postToEditable = (post: Partial<Post>) => {
  return {
    _id: post._id,
    author: post.author?._id,
    title: post.title,
    slug: post.slug,
    brief: post.brief,
    categories: post.categories ? post.categories.map((c) => c._id as string) : [],
    public: post.public,
    tags: post.tags,
    featuredImage: post.featuredImage?._id,
    createdOn: post.createdOn,
  } as UpdatePostInput;
};

const PostForm: React.FC<Props> = (props) => {
  let _editableRef = postToEditable(props.post);
  const doc = props.post.document!;
  const template = doc.template;

  const [dirty, setDirty] = useState<boolean>(false);
  const [editable, setEditable] = useState<Partial<UpdatePostInput>>(_editableRef);
  const [featuredImage, setFeaturedImage] = useState<File | null>(props.post.featuredImage || null);
  const [selectedUser, setSelectedUser] = useState<User | null>(props.post.author || null);
  const [currentTagText, setCurrentTagText] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(template._id as string);
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const updateEditable = (post: Partial<UpdatePostInput>) => {
    setEditable(post);
    setDirty(true);
  };

  useEffect(() => {
    _editableRef = postToEditable(props.post);
    const doc = props.post.document!;
    const template = doc.template;

    setEditable(_editableRef);
    setCurrentTagText('');
    setDirty(false);
    setActiveTemplate(template._id.toString());
  }, [props.post]);

  const addTag = () => {
    const text = currentTagText.trim();
    if (editable.tags!.indexOf(text) !== -1) return;
    if (text === '') return;

    setCurrentTagText('');
    updateEditable({
      ...editable,
      tags: editable.tags!.concat(currentTagText.trim()),
    });
  };

  const getSlug = (title: string) => {
    if (slugWasEdited) return editable.slug;

    let toRet = title.toLowerCase().replace(/\s+/g, '-');
    toRet = toRet.replace(/[^a-zA-Z0-9 -]/g, '');
    return toRet;
  };

  const isPostValid = () => {
    if (!editable.title || editable.title.trim() === '') return false;
    if (!editable.slug || editable.slug.trim() === '') return false;

    return true;
  };

  const renderUpdateBox = () => {
    const isAdmin = props.isAdmin;

    return (
      <ExpansionPanel expanded={true} className="mt-update-panel">
        <ExpansionPanelDetails>
          <div className="mt-panel-inner">
            <div className="mt-panel-publish">
              <div>
                <Tooltip title="Preview Post" placement="left">
                  <IconButton id="mt-post-preview-btn" onClick={(e) => props.onRequestPreview()}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </div>
              <div>
                <Button
                  variant="contained"
                  className="mt-post-confirm"
                  onClick={(e) => {
                    if (props.post && props.onUpdate) props.onUpdate(editable);
                    else if (props.onCreate) props.onCreate(editable as AddPostInput);
                  }}
                  color="primary"
                  fullWidth={true}
                  disabled={!isPostValid()}
                >
                  Update
                </Button>
              </div>
            </div>

            <FormControl className="mt-visibility-toggle">
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={editable.public ? true : false}
                    onChange={(e) => {
                      updateEditable({
                        ...editable,
                        public: editable.public ? false : true,
                      });
                    }}
                  />
                }
                label={
                  <span className="mt-visibility-toggle-label">
                    {editable.public ? 'Post is public' : 'Post is private'}
                  </span>
                }
              />
            </FormControl>
            {props.post ? (
              <Dates>
                <div>Created: </div>
                <div>
                  {isAdmin ? (
                    <span onClick={(e) => setIsDateOpen(true)}>
                      <EditIcon id="mt-edit-created-date" />
                    </span>
                  ) : undefined}

                  {isAdmin ? (
                    <DatePicker
                      leftArrowIcon={<ChevronLeft id="mt-date-prev-month" />}
                      rightArrowIcon={<ChevronRight id="mt-date-next-month" />}
                      okLabel={<span data-test="date-confirm">OK</span>}
                      open={isDateOpen}
                      onOpen={() => setIsDateOpen(true)}
                      onClose={() => setIsDateOpen(false)}
                      DialogProps={{ className: 'mt-picker-content' }}
                      className="mt-created-on-picker"
                      style={{ display: 'none' }}
                      value={new Date(editable.createdOn!)}
                      onChange={(e: Date) =>
                        updateEditable({
                          ...editable,
                          createdOn: e.getTime(),
                        })
                      }
                    />
                  ) : undefined}
                  <span id="mt-post-created-date">{format(new Date(editable.createdOn!), 'MMM do, yyyy')}</span>
                </div>
                <div>Updated: </div>
                <div id="mt-post-updated-date">{format(new Date(props.post.lastUpdated!), 'MMM do, yyyy')}</div>
              </Dates>
            ) : undefined}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderTags = () => {
    return (
      <ExpansionPanel className="mt-tags-panel">
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
          <h3>Post Tags</h3>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="mt-panel-inner">
            <TagsInput style={{ display: 'flex' }}>
              <div>
                <TextField
                  id="mt-add-new-tag"
                  helperText="Type a tag and hit enter"
                  value={currentTagText}
                  fullWidth={true}
                  onKeyUp={(e) => {
                    if (e.keyCode === 13 && currentTagText.trim() !== '') addTag();
                  }}
                  onChange={(e) => setCurrentTagText(e.currentTarget.value)}
                />
              </div>
              <div>
                <IconButton id="mt-add-tag" onClick={(e) => addTag()} style={{ margin: '0 4px' }}>
                  <AddIcon />
                </IconButton>
              </div>
            </TagsInput>
            <TagWrapper>
              {editable.tags!.map((tag, tagIndex) => {
                return (
                  <Chip
                    key={`tag-${tagIndex}`}
                    label={tag}
                    className="mt-tag-chip"
                    style={{ margin: '4px 4px 0 0' }}
                    onDelete={(e) => {
                      updateEditable({
                        ...editable,
                        tags: editable.tags!.filter((t) => t !== tag),
                      });
                    }}
                  />
                );
              })}
            </TagWrapper>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderMeta = () => {
    return (
      <ExpansionPanel className="mt-meta-panel">
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
          <h3>Post Meta Data</h3>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="mt-panel-inner">
            <TextField
              id="mt-post-desc"
              value={editable.brief || ''}
              fullWidth={true}
              multiline={true}
              helperText="Post Brief Description"
              onChange={(e) => {
                updateEditable({
                  ...editable,
                  brief: e.currentTarget.value,
                });
              }}
            />
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderFeaturedImg = () => {
    return (
      <ExpansionPanel className="mt-featured-panel">
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
          <h3>Featured Image</h3>
          {editable.featuredImage ? (
            <Icon
              id="mt-remove-featured"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateEditable({
                  ...editable,
                  featuredImage: '',
                });
              }}
              style={{
                margin: '5px 0px 0px 18px',
                position: 'absolute',
                right: '40px',
              }}
            >
              <RemoveIcon style={{ fontSize: '18px', color: theme.primary200.background }} />
            </Icon>
          ) : undefined}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div style={{ position: 'relative', flex: '1' }}>
            <FeaturedImg id="mt-featured-img" onClick={(e) => setShowMediaPopup(true)}>
              <Tooltip title="Click to upload image">
                {featuredImage ? <img src={featuredImage.publicURL} /> : <img src={'/images/post-feature.svg'} />}
              </Tooltip>
            </FeaturedImg>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderCategories = () => {
    return (
      <ExpansionPanel className="mt-categories-panel">
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
          <h3>Categories</h3>
          {props.categoriesLoading ? (
            <span style={{ margin: '4px 0 0 15px' }} className="mt-cat-loading">
              <CircularProgress size={20} />
            </span>
          ) : undefined}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="mt-panel-inner">
            <CategoryEditor
              onCategorySelected={(category) => {
                let newIds: string[] = [];
                const index = editable.categories!.indexOf(category._id as string);

                if (index === -1) newIds = editable.categories!.concat(category._id as string) as string[];
                else newIds = editable.categories!.filter((f) => f !== category._id) as string[];

                updateEditable({
                  ...editable,
                  categories: newIds,
                });
              }}
              {...({
                selected: editable.categories || [],
              } as any)}
            />
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderTemplates = () => {
    const templates = props.templates;
    const templateId = activeTemplate;
    const doc = props.post.document!;
    const curTemplate = doc.template;

    return (
      <ExpansionPanel className="mt-templates-panel">
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
          <h3>Templates</h3>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="mt-panel-inner">
            {templates.busy || !templates.templatesPage ? (
              <CircularProgress className="mt-loading mt-loading-templates" size={30} style={{ margin: '10px auto' }} />
            ) : (
              <List>
                {templates.templatesPage.data.map((t) => (
                  <ListItem key={t._id as string} className="mt-template-item">
                    <ListItemText className="mt-template-item-name" primary={t.name} />
                    <ListItemSecondaryAction>
                      <Switch
                        color="primary"
                        className="mt-template-item-switch"
                        onChange={(e) => setActiveTemplate(t._id)}
                        checked={templateId === (t._id as string)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <Button
              color="primary"
              variant="contained"
              id="mt-apply-template"
              fullWidth={true}
              disabled={activeTemplate === curTemplate._id}
              onClick={(e) => props.onTemplateChanged(activeTemplate)}
            >
              Apply Template
            </Button>

            {dirty ? (
              <div
                style={{
                  textAlign: 'center',
                  color: theme.error.background,
                  margin: '20px 0 0 0',
                }}
                id="mt-template-changes-warning"
              >
                Note: You have unsaved changes, these will be overritten if you apply a new template
              </div>
            ) : undefined}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderElementProperties = () => {
    if (props.selectedElements.length === 0) return null;

    const element = props.elements.find((e) => e._id === props.selectedElements[0]);
    let editor: { title: string; editor: JSX.Element } | null = null;

    if (!element) return null;

    if (element.type === 'image') {
      const image = element;
      editor = {
        title: 'Image Properties',
        editor: (
          <ImageEditor
            style={image.style}
            selectedElement={element}
            onChange={(style) => {
              props.onUpdateElm({ _id: image._id, style }, null, 'none');
            }}
          />
        ),
      };
    }

    if (!editor) return null;

    return (
      <ExpansionPanel className="mt-elements-panel" defaultExpanded={true}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
          <h3>{editor.title}</h3>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="mt-panel-inner">{editor.editor}</div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  return (
    <Form animated={props.animated}>
      <div>
        <div>
          <input
            id="mt-post-title"
            value={editable.title || ''}
            placeholder="Enter Post Title"
            onChange={(e) => {
              updateEditable({
                ...editable,
                title: e.currentTarget.value,
                slug: getSlug(e.currentTarget.value),
              });
            }}
          />
          <SlugContainer>
            <div>
              <SlugEditor
                value={editable.slug || ''}
                onChange={(value) => {
                  setSlugWasEdited(true);
                  updateEditable({
                    ...editable,
                    slug: value,
                  });
                }}
              />
            </div>
            <div>
              <i>Author: </i>
              <UserPicker
                canEdit={props.isAdmin}
                onChange={(user) => {
                  setSelectedUser(user);
                  updateEditable({
                    ...editable,
                    author: user ? user._id : '',
                  });
                }}
                user={selectedUser ? selectedUser : null}
              />
            </div>
          </SlugContainer>
        </div>
        <ElmEditor
          elements={props.elements}
          document={doc!}
          onCreateElm={(elms, index) => {
            setDirty(true);
            props.onCreateElm(elms, index);
          }}
          onUpdateElm={(id, html, createParagraph, deselect) => {
            setDirty(true);
            props.onUpdateElm({ _id: id, html }, createParagraph, deselect);
          }}
          onDeleteElm={(ids) => {
            setDirty(true);
            props.onDeleteElements(ids);
          }}
          onSelectionChanged={(uids, focus) => props.onSelectionChanged(uids, focus)}
          selected={props.selectedElements}
          focussedId={props.focussedId}
        />
        {props.renderAfterForm ? props.renderAfterForm() : undefined}
      </div>
      <div>
        {renderUpdateBox()}
        {renderElementProperties()}
        {renderTags()}
        {renderMeta()}
        {renderFeaturedImg()}
        {renderCategories()}
        {renderTemplates()}
      </div>

      {showMediaPopup ? (
        <MediaModal
          open={true}
          onCancel={() => setShowMediaPopup(false)}
          onSelect={(file) => {
            setShowMediaPopup(false);
            setFeaturedImage(file);
            updateEditable({
              ...editable,
              featuredImage: file._id,
            });
          }}
        />
      ) : undefined}
    </Form>
  );
};

export default PostForm;

interface FormStyleProps extends React.HTMLAttributes<HTMLElement> {
  animated: boolean;
}

const Form = styled.form`
  padding: 10px;
  display: flex;

  h3 {
    margin: 5px 0;
  }

  ${(props: FormStyleProps) => (!props.animated ? '* { transition: none !important; }' : '')}

  .mt-panel-inner {
    width: 100%;
  }

  #mt-edit-created-date {
    color: ${theme.primary100.background};
    font-size: 16px;
    margin: 0 10px 0 0;
    vertical-align: middle;
    cursor: pointer;
    &:hover {
      color: ${theme.primary200.background};
    }
  }

  #mt-post-title {
    display: block;
    width: 100%;
    padding: 10px;
    border: 1px solid ${theme.light100.border};
    border-radius: 4px;
    box-sizing: border-box;
    transition: 0.5s border;
    font-size: 20px;
    font-weight: lighter;

    &::placeholder {
      color: ${theme.light100.softColor};
    }
    &:active,
    &:focus {
      border: 1px solid ${theme.primary100.border};
      outline: none;
    }
  }

  .mt-panel-publish {
    display: flex;
    align-items: center;
    justify-content: center;

    > div {
      flex: 1;
    }

    > div:nth-child(1) {
      max-width: 60px;
    }
  }

  > div:nth-child(1) {
    flex: 2;
  }

  > div:nth-child(2) {
    flex: 1;
    margin: 0 0 0 20px;
    max-width: 350px;
  }
`;

const FeaturedImg = styled.div`
  text-align: center;
  cursor: pointer;
  img {
    max-height: 100%;
    max-width: 100%;
  }
`;

const SlugContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 2px 0 8px 0;

  > div:nth-child(1) {
    flex: 1;
  }

  > div:nth-child(2) {
    flex: 0 1 auto;
  }

  > div > i {
    vertical-align: middle;
    color: ${theme.light200.softColor};
  }
`;

const TagWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Dates = styled.div`
  display: flex;
  flex-wrap: wrap;

  > div {
    flex: 50%;
    &:nth-child(2n + 1) {
      font-style: italic;
    }
    &:nth-child(2n + 0) {
      text-align: right;
    }
  }
`;

const TagsInput = styled.div`
  display: flex;
  align-items: center;
  > div:nth-child(1) {
    flex: 1;
  }
  > div:nth-child(2) {
    flex: 1;
    max-width: 50px;
  }
`;

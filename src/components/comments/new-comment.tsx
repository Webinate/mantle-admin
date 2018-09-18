import * as React from 'react';
import { default as styled } from 'modepress/clients/modepress-admin/src/theme/styled';
import { IUserEntry } from 'modepress';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import { generateAvatarPic } from 'modepress/clients/modepress-admin/src/utils/component-utils';
import theme from '../../theme/mui-theme';

export type Props = {
  auth: IUserEntry<'client'>;
  onNewComment: ( comment: string ) => void;
}

type State = {
  comment: string;
};

export default class NewComment extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      comment: ''
    }
  }

  render() {
    return (
      <Container>
        <div>
          <Avatar src={generateAvatarPic( this.props.auth )} />
        </div>
        <div>
          <textarea
            placeholder="Write a comment"
            id="mt-new-comment-content"
            value={this.state.comment}
            onKeyDown={e => {
              if ( e.keyCode === 13 )
                this.props.onNewComment( this.state.comment );
            }}
            onChange={( e ) => {
              e.currentTarget.style.height = '1px';
              e.currentTarget.style.height = ( 20 + e.currentTarget.scrollHeight ) + 'px';

              this.setState( { comment: e.currentTarget.value } )
            }}
          />
          <div className="mt-comment-form-actions">
            <IconButton style={{ height: '40px', width: '40px' }}>
              <CommentIcon style={{ fontSize: '18px' }} />
            </IconButton>
          </div>

        </div>

      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  padding: 20px 0;

  > div {
    flex: 1;
    &:first-child {
      max-width: 60px;
    }
  }

  .mt-comment-form-actions {
    text-align: right;
  }

  textarea {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 5px;
    border: 1px solid ${theme.light100.border };
    resize: none;
    font-weight: lighter;
  }
`;
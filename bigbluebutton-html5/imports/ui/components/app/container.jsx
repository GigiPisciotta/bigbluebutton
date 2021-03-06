import React, { Component, PropTypes, cloneElement } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import App from './component';
import {
  subscribeForData,
  wasUserKicked,
  redirectToLogoutUrl,
  getModal,
  getCaptionsStatus,
} from './service';

import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';
import ClosedCaptionsContainer from '../closed-captions/container';
import UserListService from '../user-list/service';
import Auth from '/imports/ui/services/auth';

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,

  //CCs UI is commented till the next pull request
  captions: <ClosedCaptionsContainer />,
};

class AppContainer extends Component {
  render() {
    // inject location on the navbar container
    let navbarWithLocation = cloneElement(this.props.navbar, { location: this.props.location });

    return (
      <App {...this.props} navbar={navbarWithLocation}>
        {this.props.children}
      </App>
    );
  }
}

let loading = true;
const loadingDep = new Tracker.Dependency;

const getLoading = () => {
  loadingDep.depend();
  return loading;
};

const setLoading = (val) => {
  if (val !== loading) {
    loading = val;
    loadingDep.changed();
  }
};

const checkUnreadMessages = () => {
  return UserListService.getOpenChats().map(chat=> chat.unreadCounter)
                        .filter(userID => userID !== Auth.userID);
};

const openChats = (chatID) => {
  // get currently opened chatID
  return UserListService.getOpenChats(chatID).map(chat => chat.id);
}

export default createContainer(({ params }) => {
  Promise.all(subscribeForData())
  .then(() => {
    setLoading(false);
  });

  return {
    wasKicked: wasUserKicked(),
    isLoading: getLoading(),
    modal: getModal(),
    unreadMessageCount: checkUnreadMessages(),
    openChats: openChats(params.chatID),
    openChat: params.chatID,
    getCaptionsStatus,
    redirectToLogoutUrl,
  };
}, AppContainer);

AppContainer.defaultProps = defaultProps;

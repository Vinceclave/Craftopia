import React, { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const RootNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;

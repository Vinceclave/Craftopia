import React, { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import AuthNavigator from 'screens/auth/AuthNavigator';

const RootNavigator = () => {
    const { isAuthenticate } = useContext(AuthContext);

    return isAuthenticate ? "" : <AuthNavigator />
}

export default RootNavigator;
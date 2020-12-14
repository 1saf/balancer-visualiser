import React, { FC, useContext, useEffect, useState } from 'react';
import { RouterProvider } from 'react-router5';
import AppLayout from '../layouts/AppLayout';

import { ThemeProvider } from 'styled-components';
import Theme from '../style/Theme';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/analytics';

const firebaseConfig = {
    apiKey: 'AIzaSyDGyZ3kJw-nzkiEOzOwQSb4tWxrV9M2eQg',
    authDomain: 'balancer-33c17.firebaseapp.com',
    databaseURL: 'https://balancer-33c17.firebaseio.com',
    projectId: 'balancer-33c17',
    storageBucket: 'balancer-33c17.appspot.com',
    messagingSenderId: '443588964525',
    appId: '1:443588964525:web:46281bc5e2e68fa3ce1624',
    measurementId: 'G-0GZMMGVV0P',
};

type Props = {
    router?: any;
};

export const FirebaseContext = React.createContext(null as firebase.app.App);
export const useFirebase = () => useContext(FirebaseContext);

const AppContainer: FC<Props> = ({ router }) => {
    const [firebaseApp, setFirebaseApp] = useState(null);

    useEffect(() => {
        setFirebaseApp(firebase.initializeApp(firebaseConfig));

        const db = firebase.firestore();
        if (location.hostname === 'localhost') {
            db.useEmulator('localhost', 8080);
        }
        firebase.analytics();
    }, []);

    return (
        <RouterProvider router={router}>
            <FirebaseContext.Provider value={firebaseApp}>
                {firebaseApp && (
                    <ThemeProvider theme={Theme}>
                        <AppLayout />
                    </ThemeProvider>
                )}
            </FirebaseContext.Provider>
        </RouterProvider>
    );
};

export default AppContainer;

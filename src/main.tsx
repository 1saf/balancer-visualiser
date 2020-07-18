import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './containers/App';
import createRouter from './router/createRoutes';

const router = createRouter();

router.start(() => {
    ReactDOM.render(<AppContainer router={router}/>, document.getElementById('root'))
});

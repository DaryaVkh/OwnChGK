import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './app';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';
import {applyMiddleware, compose, createStore, Store} from 'redux';
import {AppReducerState} from './redux/reducers/app-reducer/app-reducer.interfaces';
import rootReducer from './redux/reducers/root-reducer';
import {Provider} from 'react-redux';

export const composeEnhancers = (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export interface AppStore {
    appReducer: AppReducerState;
}

const store: Store<AppStore> = createStore(rootReducer, composeEnhancers(applyMiddleware()));

ReactDOM.render(
    <Provider store={store}>
        <React.StrictMode>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </React.StrictMode>
    </Provider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log rating (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

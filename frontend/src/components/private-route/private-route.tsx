import React from "react";
import {Route, Redirect, RouteProps} from 'react-router-dom';
import {store} from "../../index";

export type ProtectedRouteProps = {
    neededRole: string[];
    redirectPath: string;
} & RouteProps;

export default function ProtectedRoute({neededRole, redirectPath, ...routeProps}: ProtectedRouteProps) {
    if (neededRole.includes(store.getState().appReducer.user.role)) {
        return <Route {...routeProps} />;
    } else {
        return <Redirect to={{ pathname: redirectPath }} />;
    }
};
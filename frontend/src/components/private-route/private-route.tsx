import React from 'react';
import {Route, Redirect, RouteProps} from 'react-router-dom';

export type ProtectedRouteProps = {
    neededRole: string[];
    redirectPath: string;
    currentUserRole: string;
} & RouteProps;

export default function ProtectedRoute({neededRole, redirectPath, currentUserRole, ...routeProps}: ProtectedRouteProps) {
    if (neededRole.includes(currentUserRole)) {
        return <Route {...routeProps} />;
    } else {
        return <Redirect to={{pathname: redirectPath}}/>;
    }
};
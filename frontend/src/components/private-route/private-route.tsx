import React from 'react';
import {Route, Redirect, RouteProps} from 'react-router-dom';

export type ProtectedRouteProps = {
    neededRole: string[];
    redirectPath: string;
    currentUserRole: string;
    extraCondition?: boolean;
} & RouteProps;

export default function ProtectedRoute({neededRole, redirectPath, currentUserRole, extraCondition, ...routeProps}: ProtectedRouteProps) {
    if (neededRole.includes(currentUserRole) && (extraCondition !== undefined && extraCondition || !extraCondition)) {
        return <Route {...routeProps} />;
    } else {
        return <Redirect to={{pathname: redirectPath}}/>;
    }
};
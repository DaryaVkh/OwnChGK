import React, {FC} from "react";
import {Route, Redirect} from 'react-router-dom';
import {PrivateRouteProps} from "../../entities/private-route/private-route.interfaces";

const PrivateRoute: FC<PrivateRouteProps> = props => {
    return (
        <Route
            {...props.rest}
            render={() =>
                props.isAuthorized ? (
                    props.children
                ) : (
                    <Redirect to="/"/>
                )
            }
        />
    );
}
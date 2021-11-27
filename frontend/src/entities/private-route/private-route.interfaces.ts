import {RouteProps} from 'react-router-dom';

export interface PrivateRouteProps {
    isAuthorized: boolean;
    rest: RouteProps;
}
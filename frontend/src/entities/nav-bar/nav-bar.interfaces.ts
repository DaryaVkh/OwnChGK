import {Dispatch, SetStateAction} from "react";

export interface NavBarProps {
    isAdmin: boolean;
    page: string;
    onLinkChange?: Dispatch<SetStateAction<string>>;
}
import {Dispatch, SetStateAction} from "react";

export interface InputWithAdornmentProps {
    name: string;
    type: 'game' | 'team';
    openModal: Dispatch<SetStateAction<boolean>>;
    setItemForDeleteName: Dispatch<SetStateAction<string>>;
}
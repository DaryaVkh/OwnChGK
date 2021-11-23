import {Dispatch, SetStateAction} from "react";

export interface ModalProps {
    closeModal: Dispatch<SetStateAction<boolean>>;
    deleteElement: Dispatch<SetStateAction<string[]>>;
    itemForDeleteName: string;
}
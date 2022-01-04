import {Dispatch, SetStateAction} from 'react';
import {Game, Team} from '../../pages/admin-start-screen/admin-start-screen';

export interface ModalProps {
    closeModal: Dispatch<SetStateAction<boolean>>;
    deleteElement: Dispatch<SetStateAction<Game[] | Team[]>>;
    itemForDeleteName: string;
    type: 'team' | 'game';
}
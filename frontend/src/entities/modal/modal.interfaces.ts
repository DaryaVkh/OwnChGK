import {Dispatch, SetStateAction} from 'react';
import {Game, Team} from '../../pages/admin-start-screen/admin-start-screen';

export interface ModalProps {
    modalType: 'delete' | 'break';
    closeModal: Dispatch<SetStateAction<boolean>>;
    deleteElement?: Dispatch<SetStateAction<Game[] | Team[] | undefined>>;
    itemForDeleteName?: string;
    itemForDeleteId?: string;
    type?: 'team' | 'game';
    startBreak?: Dispatch<SetStateAction<boolean>>;
    setBreakTime?: Dispatch<SetStateAction<number>>;
}
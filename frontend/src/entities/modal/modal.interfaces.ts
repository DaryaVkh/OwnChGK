import {Dispatch, SetStateAction} from 'react';
import {Game, Team} from '../../pages/admin-start-screen/admin-start-screen';
import {GamePartSettings} from "../../server-api/server-api";

export interface ModalProps {
    modalType: 'delete' | 'break' | 'delete-game-part';
    closeModal: Dispatch<SetStateAction<boolean>>;
    setGamePartUndefined?: Dispatch<SetStateAction<GamePartSettings | undefined>>;
    deleteElement?: Dispatch<SetStateAction<Game[] | Team[] | undefined>>;
    itemForDeleteName?: string;
    itemForDeleteId?: string;
    type?: 'team' | 'game';
    startBreak?: Dispatch<SetStateAction<boolean>>;
    setBreakTime?: Dispatch<SetStateAction<number>>;
}
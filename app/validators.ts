import {Participant} from "./db/entities/Team";
import {validateEmail} from "./email";
import {GameStatus} from "./db/entities/Game";

export const validateParticipants = (value: any) => {
    try {
        const participants = value as Participant[];
        for (const item of participants) {
            const participant = item as Participant;
            if (typeof participant.email !== 'string' || !validateEmail(participant.email) || typeof participant.name !== 'string') {
                return false;
            }
        }
        return true;
    } catch {
        return false;
    }
}

export const validateGameStatus = (value: any) => {
    return Object.values(GameStatus).includes(value);
}
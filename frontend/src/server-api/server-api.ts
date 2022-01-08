export const getAll = async (path: string) => {
    return await fetch(path);
};

export const getAmIParticipateGames = async () => {
    return await fetch('/games/?amIParticipate=true');
};

export const getResult = async (gameId: string) => {
    return await fetch(`/games/${gameId}/result`);
};

export const getResultTable = async (gameId: string) => {
    return await fetch(`/games/${gameId}/resultTable`);
};

export const getUsersWithoutTeam = async () => {
    return await fetch(`/users/?withoutTeam=true`);
};

export const getGame = async (gameId: string) => {
    return await fetch(`/games/${gameId}`);
};

export const createGame = async (gameName: string, roundCount: number, questionCount: number, teams: string[]) => {
    return await fetch('/games/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            gameName,
            roundCount,
            questionCount,
            teams
        })
    });
};

export const editGame = async (gameId: string, newGameName: string, roundCount: number, questionCount: number, teams: string[]) => {
    return await fetch(`/games/${gameId}/change`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            newGameName,
            roundCount,
            questionCount,
            teams
        })
    });
};

export const deleteGame = async (gameName: string) => {
    return await fetch(`/games/${gameName}`, {
        method: 'DELETE'
    });
};

export const deleteTeam = async (teamName: string) => {
    return await fetch(`/teams/${teamName}`, {
        method: 'DELETE'
    });
};

export const getTeam = async (teamName: string) => {
    return await fetch(`/teams/${teamName}`);
};

export const createTeam = async (teamName: string, captain: string) => {
    return await fetch('/teams/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            teamName,
            captain
        })
    });
};

export const editTeam = async (teamName: string, newTeamName: string, captain: string) => {
    return await fetch(`/teams/${teamName}/change`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            newTeamName,
            captain
        })
    });
};

export const editTeamCaptainByCurrentUser = async (teamName: string) => {
    return await fetch(`/teams/${teamName}/changeCaptain`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        }
    });
};

export const getTeamByCurrentUser = async () => {
    return await fetch('/users/getTeam');
};

export const getTeamsWithoutUser = async () => {
    return await fetch(`/teams/?withoutUser=true`);
};

export const checkToken = async () => {
    return await fetch('/users/current');
};

export const sendTemporaryPassword = async (email: string, isAdmin: boolean) => {
    return await fetch(`/${isAdmin ? 'admins' : 'users'}/sendMail`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email
        })
    });
}

export const checkTemporaryPassword = async (email: string, code: string, isAdmin: boolean) => {
    return await fetch(`/${isAdmin ? 'admins' : 'users'}/checkTemporaryPassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email,
            code
        })
    });
}

export const changePassword = async (email: string, password: string, oldPassword: string, isAdmin=false) => {
    return await fetch(`/${isAdmin ? 'admins' : 'users'}/changePassword`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            oldPassword
        })
    });
};

export const changePasswordByCode = async (email: string, password: string, code: string, isAdmin: boolean) => {
    return await fetch(`/${isAdmin ? 'admins' : 'users'}/changePasswordByCode`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            code
        })
    });
};

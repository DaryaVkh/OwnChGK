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

export const getResultTableFormat = async (gameId: string) => {
    return await fetch(`/games/${gameId}/resultTable/format`);
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

export const createUser = async (email: string, password: string) => {
    return await fetch('/users/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });
};

export const login = async (email: string, password: string, isAdmin: boolean) => {
    return await fetch(isAdmin ? 'admins/login' : 'users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });
}

export const logout = async () => {
    return await fetch('/users/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        }
    });
}

export const changeToken = async (gameId: string) => {
    return fetch(`/users/${gameId}/changeToken`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        }
    });
}

export const startGame = async (gameId: string) => {
    return fetch(`/games/${gameId}/start`);
}

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

export const deleteGame = async (gameId: string) => {
    return await fetch(`/games/${gameId}`, {
        method: 'DELETE'
    });
};

export const deleteTeam = async (teamId: string) => {
    return await fetch(`/teams/${teamId}`, {
        method: 'DELETE'
    });
};

export const getTeam = async (teamId: string) => {
    return await fetch(`/teams/${teamId}`);
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

export const editTeam = async (teamId: string, newTeamName: string, captain: string) => {
    return await fetch(`/teams/${teamId}/change`, {
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

export const editTeamCaptainByCurrentUser = async (teamId: string) => {
    return await fetch(`/teams/${teamId}/changeCaptain`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        }
    });
};

export const deleteTeamCaptainById = async (teamId: string) => {
    return await fetch(`/teams/${teamId}/deleteCaptain`, {
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

export const changePassword = async (email: string, password: string, oldPassword: string, isAdmin = false) => {
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

export const changeName = async (newName: string, isAdmin: boolean) => {
    return await fetch(`/${isAdmin ? 'admins' : 'users'}/changeName`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            newName
        })
    });
};

export const changeIntrigueGameStatus = async (gameId: string, isIntrigue: boolean) => {
    return await fetch(`/games/${gameId}/changeIntrigueStatus`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            isIntrigue
        })
    });
}

export const deleteAdmin = async (adminEmail: string) => {
    return await fetch(`/admins/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email: adminEmail
        })
    });
}

export const addAdmin = async (adminEmail: string, adminName = '') => {
    return await fetch(`/admins/insert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email: adminEmail,
            name: adminName
        })
    });
}

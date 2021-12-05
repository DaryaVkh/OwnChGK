export const getAll = async (path: string) => {
    return await fetch(path);
}

export const getUsersWithoutTeam = async () => {
    return await fetch(`/users/?withoutTeam=true`);
}

export const getGame = async (gameName: string) => {
    return await fetch(`/games/${gameName}`);
}

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
}

export const editGame = async (oldGameName: string, newGameName: string, roundCount: number, questionCount: number, teams: string[]) => {
    return await fetch(`/games/${oldGameName}/change`, {
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
}

export const deleteGame = async (gameName: string) => {
    return await fetch(`/games/${gameName}`, {
        method: 'DELETE'
    });
}

export const deleteTeam = async (teamName: string) => {
    return await fetch(`/teams/${teamName}`, {
        method: 'DELETE'
    });
}

export const getTeam = async (teamName: string) => {
    return await fetch(`/teams/${teamName}`);
}

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
}

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
}

export const editTeamCaptainByCurrentUser = async (teamName: string) => {
    return await fetch(`/teams/${teamName}/changeCaptain`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        }
    });
}

export const getTeamByCurrentUser = async () => {
    return await fetch('/users/getTeam');
}

export const getTeamsWithoutUser = async () => {
    return await fetch(`/teams/?withoutUser=true`);
}
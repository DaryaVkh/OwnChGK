import jwt from "jsonwebtoken";

export const secret = process.env.SECRET_KEY ?? 'SECRET_KEY';

export const generateAccessToken = (id: number, email: string, roles: string, teamId: number) => {
    const payload = {
        id,
        email,
        roles,
        teamId,
    };

    return jwt.sign(payload, secret, {expiresIn: '24h'});
}
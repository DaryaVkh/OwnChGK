import jwt from "jsonwebtoken";

export const secret = process.env.SECRET_KEY ?? 'SECRET_KEY';

export const generateAccessToken = (id: boolean, email: string, roles: boolean) => {
    const payload = {
        id,
        email,
        roles
    };

    return jwt.sign(payload, secret, {expiresIn: '24h'});
}
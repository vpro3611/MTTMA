
import jwt from 'jsonwebtoken'
import {AccessTokenPayload, RefreshTokenPayload} from "../payloads/payloads.js";

export interface TokenService {
    generateAccessToken(userId: string): string
    generateRefreshToken(userId: string): string
    verifyAccessToken(token: string): AccessTokenPayload
    verifyRefreshToken(token: string): RefreshTokenPayload
}

export class JWTTokenService implements TokenService{


    generateAccessToken = (userId: string): string => {
        const accessToken = process.env.ACCESS_TOKEN_SECRET
        if (!accessToken) {
            throw new Error('No access token secret provided (set in .env file)');
        }
        return jwt.sign(
            {sub: userId},
            accessToken,
            {expiresIn: '15m'}
        );
    }

    generateRefreshToken = (userId: string): string => {
        const refreshToken = process.env.REFRESH_TOKEN_SECRET
        if (!refreshToken) {
            throw new Error('No refresh token secret provided (set in .env file)');
        }
        return jwt.sign(
            {sub: userId},
            refreshToken,
            {expiresIn: '7d'}
        );
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        const accessToken = process.env.ACCESS_TOKEN_SECRET
        if (!accessToken) {
            throw new Error('No access token secret provided (set in .env file)');
        }
        try {
            return jwt.verify(token, accessToken) as AccessTokenPayload;
        } catch (err) {
            throw new Error('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
        const refreshToken = process.env.REFRESH_TOKEN_SECRET
        if (!refreshToken) {
            throw new Error('No refresh token secret provided (set in .env file)');
        }
        try {
            return jwt.verify(token, refreshToken) as RefreshTokenPayload;
        } catch (err) {
            throw new Error('Invalid or expired refresh token');
        }
    }
}
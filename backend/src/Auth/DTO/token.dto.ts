

export type TokenDTO = {
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    revokedAt?: Date,
    createdAt: Date,
}
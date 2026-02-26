export interface User {
    id: string
    email: string
    status: string
    created_at: string
}

export interface AuthResponse {
    accessToken: string
    user: User
}

export interface RefreshResponse {
    accessToken: string
}
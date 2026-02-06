

export class Password {
    private constructor(private readonly value: string){}

    static validatePlain(plain: string): string {
        const trimmedPass = plain.trim();
        if (trimmedPass.length < 10) throw new Error("Password must be at least 10 characters long")
        if (trimmedPass.length > 255) throw new Error("Password must be at most 255 characters long")
        if (!/[A-Z]/.test(trimmedPass)) throw new Error("Password must contain at least one uppercase letter");
        if (!/[0-9]/.test(trimmedPass)) throw new Error("Password must contain at least one digit");
        if (!/[!@#$%^&*]/.test(trimmedPass)) throw new Error("Password must contain at least one special character");

        return trimmedPass;
    }

    static fromHash(hash: string) {
        return new Password(hash);
    }

    getHash() {
        return this.value;
    }
}

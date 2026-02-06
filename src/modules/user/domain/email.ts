

export class Email {
    private constructor(private readonly value: string){}

    static create(raw: string) {
        const normalized = raw.toLowerCase().trim();

        if (normalized.length < 5) throw new Error("Email must be at least 5 characters long")
        if (normalized.length > 255) throw new Error("Email must be at most 255 characters long")

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalized)) throw new Error("Invalid email format")

        return new Email(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}
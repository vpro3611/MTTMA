import { Password } from "../../src/modules/user/domain/password.js";

describe('Password (domain)', () => {

    describe('validatePlain', () => {

        it('should validate strong password and return trimmed value', () => {
            const result = Password.validatePlain('  StrongPass1!  ');

            expect(result).toBe('StrongPass1!');
        });

        it('should throw error if password is too short', () => {
            expect(() => {
                Password.validatePlain('Ab1!');
            }).toThrow('Password must be at least 10 characters long');
        });

        it('should throw error if password has no uppercase letter', () => {
            expect(() => {
                Password.validatePlain('password1!');
            }).toThrow('Password must contain at least one uppercase letter');
        });

        it('should throw error if password has no digit', () => {
            expect(() => {
                Password.validatePlain('Password!sdsada');
            }).toThrow('Password must contain at least one digit');
        });

        it('should throw error if password has no special character', () => {
            expect(() => {
                Password.validatePlain('Password1adadad');
            }).toThrow('Password must contain at least one special character');
        });

        it('should throw error if password is too long', () => {
            const longPassword =
                'A1!' + 'a'.repeat(300);

            expect(() => {
                Password.validatePlain(longPassword);
            }).toThrow('Password must be at most 255 characters long');
        });

    });

    describe('fromHash', () => {

        it('should create Password from hash without validation', () => {
            const password = Password.fromHash('hashed_password_value');

            expect(password.getHash()).toBe('hashed_password_value');
        });

    });
});

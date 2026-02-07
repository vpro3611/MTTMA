import { Password } from "../../src/modules/user/domain/password.js";
import {
    PasswordDoesNotContainDigitError,
    PasswordDoesNotContainSpecialSymbolError, PasswordDoesNotContainUppercaseLetterError,
    TooLongPasswordError, TooShortPasswordError
} from "../../src/modules/user/errors/password_domain_errors.js";

describe('Password (domain)', () => {

    describe('validatePlain', () => {

        it('should validate strong password and return trimmed value', () => {
            const result = Password.validatePlain('  StrongPass1!  ');

            expect(result).toBe('StrongPass1!');
        });

        it('should throw error if password is too short', () => {
            expect(() => {
                Password.validatePlain('Ab1!');
            }).toThrow(TooShortPasswordError);
        });

        it('should throw error if password has no uppercase letter', () => {
            expect(() => {
                Password.validatePlain('password1!');
            }).toThrow(PasswordDoesNotContainUppercaseLetterError);
        });

        it('should throw error if password has no digit', () => {
            expect(() => {
                Password.validatePlain('Password!sdsada');
            }).toThrow(PasswordDoesNotContainDigitError);
        });

        it('should throw error if password has no special character', () => {
            expect(() => {
                Password.validatePlain('Password1adadad');
            }).toThrow(PasswordDoesNotContainSpecialSymbolError);
        });

        it('should throw error if password is too long', () => {
            const longPassword =
                'A1!' + 'a'.repeat(300);

            expect(() => {
                Password.validatePlain(longPassword);
            }).toThrow(TooLongPasswordError);
        });

    });

    describe('fromHash', () => {

        it('should create Password from hash without validation', () => {
            const password = Password.fromHash('hashed_password_value');

            expect(password.getHash()).toBe('hashed_password_value');
        });

    });
});

import { Email } from "../../src/modules/user/domain/email.js";
import {InvalidEmailError, TooLongEmail, TooShortEmail} from "../../src/modules/user/errors/email_domain_errors.js";

describe('Email (domain)', () => {

    it('should create valid email and normalize it', () => {
        const email = Email.create('  Test@Example.COM  ');

        expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error if email is too short', () => {
        expect(() => {
            Email.create('a@b');
        }).toThrow(TooShortEmail);
    });

    it('should throw error if email is too long', () => {
        const longEmail =
            'a'.repeat(250) + '@a.com';

        expect(() => {
            Email.create(longEmail);
        }).toThrow(TooLongEmail);
    });

    it('should throw error if email format is invalid (no @)', () => {
        expect(() => {
            Email.create('invalid-email.com');
        }).toThrow(InvalidEmailError);
    });

    it('should throw error if email format is invalid (no domain)', () => {
        expect(() => {
            Email.create('test@');
        }).toThrow(InvalidEmailError);
    });

    it('should consider two emails with same value equal', () => {
        const email1 = Email.create('test@example.com');
        const email2 = Email.create('TEST@EXAMPLE.COM');

        expect(email1.equals(email2)).toBe(true);
    });

    it('should consider two different emails not equal', () => {
        const email1 = Email.create('a@example.com');
        const email2 = Email.create('b@example.com');

        expect(email1.equals(email2)).toBe(false);
    });

});

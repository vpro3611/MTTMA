import { Name } from "../../../src/modules/organization/domain/name.js";
import {
    NameTooShortError,
    NameTooLongError,
    NameContainsForbiddenSymbols
} from "../../../src/modules/organization/errors/name_domain_errors.js";

describe('Name (domain)', () => {

    it('should create name and trim spaces', () => {
        const name = Name.validate('   My Organization   ');

        expect(name.getValue()).toBe('My Organization');
    });

    it('should throw error if name is too short', () => {
        expect(() => {
            Name.validate('ab');
        }).toThrow(NameTooShortError);
    });

    it('should throw error if name is too long', () => {
        const longName = 'a'.repeat(256);

        expect(() => {
            Name.validate(longName);
        }).toThrow(NameTooLongError);
    });

    it('should throw error if name contains forbidden symbols', () => {
        expect(() => {
            Name.validate('My@Org');
        }).toThrow(NameContainsForbiddenSymbols);
    });

    it('should allow name with numbers and spaces', () => {
        const name = Name.validate('Org 123');

        expect(name.getValue()).toBe('Org 123');
    });

});

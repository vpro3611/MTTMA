import { Organization } from "../../../src/modules/organization/domain/organiztion_domain.js";
import { Name } from "../../../src/modules/organization/domain/name.js";

describe('Organization (domain)', () => {

    it('should create organization with valid name', () => {
        const name = Name.validate('My Org');

        const organization = Organization.create(name);

        expect(organization.getName()).toBe(name);
        expect(organization.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should allow renaming organization', () => {
        const org = Organization.create(
            Name.validate('Old Name')
        );

        const newName = Name.validate('New Name');

        org.rename(newName);

        expect(org.getName()).toBe(newName);
    });

});

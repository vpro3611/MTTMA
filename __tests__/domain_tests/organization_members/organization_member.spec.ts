import { OrganizationMember, OrgMemRole } from "../../../src/modules/organization_members/domain/organization_member_domain.js";
import { OrganizationMemberInsufficientPermissionsError } from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

describe('OrganizationMember (domain)', () => {

    const ORG_ID = 'org-1';
    const USER_ID = 'user-1';

    /**
     * hire
     */
    it('should create member with default role MEMBER', () => {
        const member = OrganizationMember.hire(ORG_ID, USER_ID);

        expect(member.getRole()).toBe('MEMBER');
        expect(member.getJoinedAt()).toBeInstanceOf(Date);
    });

    it('should create member with provided role', () => {
        const member = OrganizationMember.hire(
            ORG_ID,
            USER_ID,
            'ADMIN'
        );

        expect(member.getRole()).toBe('ADMIN');
    });

    /**
     * changeRole – permissions
     */
    it('should allow OWNER to change ADMIN role', () => {
        const member = OrganizationMember.hire(
            ORG_ID,
            USER_ID,
            'ADMIN'
        );

        member.changeRole('OWNER', 'MEMBER');

        expect(member.getRole()).toBe('MEMBER');
    });

    it('should allow ADMIN to change MEMBER role', () => {
        const member = OrganizationMember.hire(
            ORG_ID,
            USER_ID,
            'MEMBER'
        );

        member.changeRole('ADMIN', 'MEMBER');

        expect(member.getRole()).toBe('MEMBER');
    });

    it('should NOT allow ADMIN to change OWNER role', () => {
        const member = OrganizationMember.hire(
            ORG_ID,
            USER_ID,
            'OWNER'
        );

        expect(() => {
            member.changeRole('ADMIN', 'ADMIN');
        }).toThrow(OrganizationMemberInsufficientPermissionsError);
    });

    it('should NOT allow MEMBER to change any role', () => {
        const member = OrganizationMember.hire(
            ORG_ID,
            USER_ID,
            'ADMIN'
        );

        expect(() => {
            member.changeRole('MEMBER', 'MEMBER');
        }).toThrow(OrganizationMemberInsufficientPermissionsError);
    });

    it('should NOT allow promoting higher than actor role', () => {
        const member = OrganizationMember.hire(
            ORG_ID,
            USER_ID,
            'MEMBER'
        );

        expect(() => {
            member.changeRole('ADMIN', 'OWNER');
        }).toThrow(OrganizationMemberInsufficientPermissionsError);
    });

    it('should allow OWNER to fire member', () => {
        const member = OrganizationMember.hire("org", "user", "MEMBER");

        expect(() => {
            member.assertCanBeFiredBy("OWNER");
        }).not.toThrow();
    });

    it('should NOT allow ADMIN to fire member', () => {
        const member = OrganizationMember.hire("org", "user", "MEMBER");

        expect(() => {
            member.assertCanBeFiredBy("ADMIN");
        }).toThrow(OrganizationMemberInsufficientPermissionsError);
    });
});

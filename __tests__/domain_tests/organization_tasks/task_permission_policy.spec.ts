import { TaskPermissionPolicy } from
        "../../../backend/src/modules/organization_task/domain/policies/task_permission_policy.js";

import {
    OrganizationMemberInsufficientPermissionsError
} from
        "../../../backend/src/modules/organization_members/errors/organization_members_domain_error.js";

describe("TaskPermissionPolicy", () => {

    it("allows MEMBER to modify own task", () => {
        expect(() =>
            TaskPermissionPolicy.canChangeTaskElements(
                "MEMBER",
                "u1",
                "u1",
                "MEMBER"
            )
        ).not.toThrow();
    });

    it("forbids MEMBER to modify чужую задачу", () => {
        expect(() =>
            TaskPermissionPolicy.canChangeTaskElements(
                "MEMBER",
                "u1",
                "u2",
                "MEMBER"
            )
        ).toThrow(OrganizationMemberInsufficientPermissionsError);
    });

    it("allows ADMIN to modify MEMBER task", () => {
        expect(() =>
            TaskPermissionPolicy.canChangeTaskElements(
                "ADMIN",
                "a1",
                "m1",
                "MEMBER"
            )
        ).not.toThrow();
    });

    it("forbids ADMIN to modify ADMIN task", () => {
        expect(() =>
            TaskPermissionPolicy.canChangeTaskElements(
                "ADMIN",
                "a1",
                "a2",
                "ADMIN"
            )
        ).toThrow(OrganizationMemberInsufficientPermissionsError);
    });

    it("forbids ADMIN to modify OWNER task", () => {
        expect(() =>
            TaskPermissionPolicy.canChangeTaskElements(
                "ADMIN",
                "a1",
                "o1",
                "OWNER"
            )
        ).toThrow(OrganizationMemberInsufficientPermissionsError);
    });

    it("allows OWNER to modify any task", () => {
        expect(() =>
            TaskPermissionPolicy.canChangeTaskElements(
                "OWNER",
                "o1",
                "any",
                "ADMIN"
            )
        ).not.toThrow();
    });
});

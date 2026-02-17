import { GetAllMembersUseCase } from "../../../src/modules/organization_members/application/get_all_members_use_case.js";
import { ActorNotAMemberError } from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

describe("GetAllMembersUseCase", () => {

    let repo: any;
    let useCase: GetAllMembersUseCase;

    const createMockMember = (
        organizationId: string,
        userId: string,
        role: string,
        joinedAt: Date
    ) => ({
        organizationId,
        userId,
        getRole: jest.fn().mockReturnValue(role),
        getJoinedAt: jest.fn().mockReturnValue(joinedAt),
    });

    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            getAllMembers: jest.fn(),
        };

        useCase = new GetAllMembersUseCase(repo);
    });

    it("should return mapped members if actor is member", async () => {

        const actorMember = createMockMember(
            "org-1",
            "actor-1",
            "ADMIN",
            new Date("2024-01-01")
        );

        const member2 = createMockMember(
            "org-1",
            "user-2",
            "MEMBER",
            new Date("2024-02-01")
        );

        repo.findById.mockResolvedValue(actorMember);
        repo.getAllMembers.mockResolvedValue([actorMember, member2]);

        const result = await useCase.execute("actor-1", "org-1");

        expect(repo.findById).toHaveBeenCalledWith("actor-1", "org-1");
        expect(repo.getAllMembers).toHaveBeenCalledWith("org-1");

        expect(result).toEqual([
            {
                organizationId: "org-1",
                userId: "actor-1",
                role: "ADMIN",
                joinedAt: new Date("2024-01-01"),
            },
            {
                organizationId: "org-1",
                userId: "user-2",
                role: "MEMBER",
                joinedAt: new Date("2024-02-01"),
            },
        ]);
    });

    it("should throw ActorNotAMemberError if actor is not a member", async () => {

        repo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute("actor-1", "org-1")
        ).rejects.toThrow(ActorNotAMemberError);

        expect(repo.getAllMembers).not.toHaveBeenCalled();
    });

    it("should propagate repository error", async () => {

        repo.findById.mockRejectedValue(new Error("DB error"));

        await expect(
            useCase.execute("actor-1", "org-1")
        ).rejects.toThrow("DB error");
    });

});

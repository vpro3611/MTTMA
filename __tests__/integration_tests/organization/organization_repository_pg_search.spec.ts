
import { OrganizationRepositorySearch } from "../../../backend/src/modules/organization/repository_realization/organization_repository_search.js";
import { SearchOrganizationCriteria } from "../../../backend/src/modules/organization/DTO/search_criteria.js";

describe("OrganizationRepositorySearch.search", () => {

    let mockQuery: jest.Mock;
    let repo: OrganizationRepositorySearch;

    beforeEach(() => {
        mockQuery = jest.fn();
        repo = new OrganizationRepositorySearch({ query: mockQuery } as any);
    });

    it("should perform basic search with default sort and pagination", async () => {

        mockQuery.mockResolvedValue({
            rows: [
                {
                    id: "org-1",
                    name: "Test Org",
                    created_at: new Date("2024-01-01"),
                    members_count: "3"
                }
            ]
        });

        const criteria: SearchOrganizationCriteria = {
            query: "Test"
        };

        const result = await repo.search(criteria);

        expect(mockQuery).toHaveBeenCalledTimes(1);

        const [sql, values] = mockQuery.mock.calls[0];

        expect(sql).toContain("o.name ILIKE");
        expect(sql).toContain("ORDER BY o.created_at DESC");
        expect(sql).toContain("LIMIT");
        expect(sql).toContain("OFFSET");

        expect(values).toEqual([
            "%Test%",
            20,
            0
        ]);

        expect(result).toEqual([
            {
                id: "org-1",
                name: "Test Org",
                createdAt: new Date("2024-01-01"),
                membersCount: 3
            }
        ]);
    });

    it("should apply createdFrom and createdTo filters", async () => {

        mockQuery.mockResolvedValue({ rows: [] });

        const criteria: SearchOrganizationCriteria = {
            query: "Org",
            createdFrom: new Date("2024-01-01"),
            createdTo: new Date("2024-12-31"),
        };

        await repo.search(criteria);

        const [sql, values] = mockQuery.mock.calls[0];

        expect(sql).toContain("o.created_at >=");
        expect(sql).toContain("o.created_at <=");

        expect(values[0]).toBe("%Org%");
        expect(values[1]).toEqual(criteria.createdFrom);
        expect(values[2]).toEqual(criteria.createdTo);
    });

    it("should sort by membersCount ascending", async () => {

        mockQuery.mockResolvedValue({ rows: [] });

        const criteria: SearchOrganizationCriteria = {
            query: "Org",
            sortBy: "membersCount",
            order: "asc"
        };

        await repo.search(criteria);

        const [sql] = mockQuery.mock.calls[0];

        expect(sql).toContain("ORDER BY members_count ASC");
    });

    it("should apply custom limit and offset", async () => {

        mockQuery.mockResolvedValue({ rows: [] });

        const criteria: SearchOrganizationCriteria = {
            query: "Org",
            limit: 10,
            offset: 30,
        };

        await repo.search(criteria);

        const [, values] = mockQuery.mock.calls[0];

        expect(values).toContain(10);
        expect(values).toContain(30);
    });

    it("should return empty array if no rows", async () => {

        mockQuery.mockResolvedValue({ rows: [] });

        const criteria: SearchOrganizationCriteria = {
            query: "Nothing"
        };

        const result = await repo.search(criteria);

        expect(result).toEqual([]);
    });

});

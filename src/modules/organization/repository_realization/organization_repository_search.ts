import {Pool, PoolClient} from "pg";
import {OrganizationSearchResultDto, SearchOrganizationCriteria} from "../DTO/search_criteria.js";
import {SearchOrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {OrganizationPersistenceError} from "../errors/organization_repository_errors.js";

export class OrganizationRepositorySearch implements SearchOrganizationRepository{
    constructor(private readonly pool: Pool | PoolClient) {}

    search = async (criteria: SearchOrganizationCriteria): Promise<OrganizationSearchResultDto[]> => {
        try {
            const values: any[] = [];
            const conditions: string[] = [];

            // name search (обязательный)
            values.push(`%${criteria.query}%`);
            conditions.push(`o.name ILIKE $${values.length}`);

            // createdFrom
            if (criteria.createdFrom) {
                values.push(criteria.createdFrom);
                conditions.push(`o.created_at >= $${values.length}`);
            }

            // createdTo
            if (criteria.createdTo) {
                values.push(criteria.createdTo);
                conditions.push(`o.created_at <= $${values.length}`);
            }

            const whereClause = conditions.length
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

            // sorting

            const sortByMap: Record<"createdAt" | "membersCount", string> = {
                createdAt: "o.created_at",
                membersCount: "members_count"
            };

            const sortKey = criteria.sortBy ?? "createdAt";

            const sortColumn =
                sortByMap[sortKey as keyof typeof sortByMap]
                ?? sortByMap["createdAt"];

            const order =
                criteria.order === "asc" ? "ASC" : "DESC";


            // pagination
            const limit = criteria.limit ?? 20;
            const offset = criteria.offset ?? 0;

            values.push(limit);
            const limitIndex = values.length;

            values.push(offset);
            const offsetIndex = values.length;

            const query = `
                SELECT o.id,
                       o.name,
                       o.created_at,
                       COUNT(m.user_id) AS members_count
                FROM organizations o
                         LEFT JOIN organization_members m
                                   ON m.organization_id = o.id
                    ${whereClause}
                GROUP BY o.id
                ORDER BY ${sortColumn} ${order}
                    LIMIT $${limitIndex}
                OFFSET $${offsetIndex};
            `;

            const result = await this.pool.query(query, values);

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                createdAt: row.created_at,
                membersCount: Number(row.members_count)
            }));
        } catch  {
            throw new OrganizationPersistenceError();
        }
    }
}




import {
    OrganizationMembersRepository
} from "../../organization_members/domain/ports/organization_memebers_repo_interface.js";
import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../organization_members/errors/organization_members_domain_error.js";
import {AuditEventReader} from "../domain/ports/audit_event_reader_interface.js";


export class GetOrganizationAuditUseCase {
    constructor(private readonly auditEventReader: AuditEventReader,
                private readonly orgMemberRepo: OrganizationMembersRepository,
    ) {}

    execute = async (actorId: string, organizationId: string) => {
        const actor = await this.orgMemberRepo.findById(actorId, organizationId);
        if (!actor) {
            throw new ActorNotAMemberError();
        }

        if (actor.getRole() === "MEMBER") {
            throw new OrganizationMemberInsufficientPermissionsError()
        }

        return await this.auditEventReader.getById(organizationId);
    }
}
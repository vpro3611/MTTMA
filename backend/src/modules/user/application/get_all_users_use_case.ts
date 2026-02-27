import {UserRepository, UserRepositoryReadOnly} from "../domain/ports/user_repo_interface.js";
import {UserNotFoundError} from "../../organization_members/errors/organization_members_repo_errors.js";
import {User} from "../domain/user_domain.js";
import {UserResponseDto} from "../DTO/user_response_dto.js";


export class GetAllUsersUseCase {
    constructor(private readonly usersRepo: UserRepository,
                private readonly userRepoRonly: UserRepositoryReadOnly,) {}

    private async userExists(actorId: string) {
        const user = await this.usersRepo.findById(actorId);
        if (!user) throw new UserNotFoundError();
        return user;
    }

    private mapToDTO(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.getEmail().getValue(),
            status: user.getStatus(),
            created_at: user.getCreatedAt(),
        };
    }

    async execute(actorId: string, page: number, limit: number) {
        const user = await this.userExists(actorId);

        user.checkUserStatus(user.getStatus());

        const result = await this.userRepoRonly.getAll(page, limit);

        return result.map(this.mapToDTO);
    }
}
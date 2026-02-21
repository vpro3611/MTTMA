import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {UserNotFoundError} from "../../organization_members/errors/organization_members_repo_errors.js";
import {User} from "../domain/user_domain.js";
import {UserResponseDto} from "../DTO/user_response_dto.js";


export class GetMeUseCase {
    constructor(private readonly userRepo: UserRepository) {}

    private async userExists(actorId: string) {
        const user = await this.userRepo.findById(actorId);
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

    async execute(actorId: string) {
        const user = await this.userExists(actorId);
        user.checkUserStatus(user.getStatus());
        const forReturn: UserResponseDto = this.mapToDTO(user);
        return forReturn;
    }
}
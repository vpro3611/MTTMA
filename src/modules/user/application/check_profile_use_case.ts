import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {UserNotFound} from "../errors/user_repository_errors.js";
import {UserResponseDto} from "../DTO/user_response_dto.js";
import {User} from "../domain/user_domain.js";


export class CheckProfileUseCase {
    constructor(private readonly userRepo: UserRepository) {}

    private async userExists(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new UserNotFound();
        }
        return user;
    }

    private mapToDTO(user: User, withPassword: boolean) : UserResponseDto {
        return {
            id: user.id,
            email: user.getEmail().getValue(),
            status: user.getStatus(),
            created_at: user.getCreatedAt(),
            password: withPassword ? user.getPasswordHash() : undefined
        }
    }

    execute = async (actorId: string, targetUserId: string) => {

        const actorUser = await this.userExists(actorId);
        const targetUser = await this.userExists(targetUserId);

        actorUser.checkUserStatus(actorUser.getStatus());

        if (actorId === targetUserId) {
            const userDto : UserResponseDto = this.mapToDTO(actorUser, true);
            return userDto;
        }

        const userDto : UserResponseDto = this.mapToDTO(targetUser, false);
        return userDto;
    }
}
import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {Email} from "../domain/email.js";
import {UserResponseDto} from "../DTO/user_response_dto.js";
import {UserNotFound} from "../errors/user_repository_errors.js";


export class ChangeUserEmailUseCase {
    constructor(private userRepository: UserRepository){}

    private async userExists(userId: string) {
        const exists = await this.userRepository.findById(userId);
        if (!exists) throw new UserNotFound();
        return exists;
    }

    async execute(userId: string, newEmail: string) {
        const exists = await this.userExists(userId);

        const newEmailVerified = Email.create(newEmail);

        exists.changeEmail(newEmailVerified);

        await this.userRepository.save(exists);

        const returnUser: UserResponseDto = {
            id: exists.id,
            email: exists.getEmail().getValue(),
            status: exists.getStatus(),
            created_at: exists.getCreatedAt(),
        }
        return returnUser;
    }
}


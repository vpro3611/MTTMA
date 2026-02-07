import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {Password} from "../domain/password.js";
import {PasswordHasher} from "./ports/password_hasher_interface.js";
import {UserResponseDto} from "../DTO/user_response_dto.js";
import {UserNotFound} from "../errors/user_repository_errors.js";
import {InvalidPasswordError} from "../errors/password_domain_errors.js";

export class ChangePasswordUseCase {
    constructor(private userRepository: UserRepository,
                private readonly hasher: PasswordHasher,
    ){}

    async execute(userId: string, oldPlain: string, newPlain: string) {
        const exists = await this.userRepository.findById(userId);
        if (!exists) throw new UserNotFound();

        const isValid = await this.hasher.compare(oldPlain, exists.getPasswordHash());

        if (!isValid) throw new InvalidPasswordError();

        const validPass = Password.validatePlain(newPlain);
        const newHash = await this.hasher.hash(validPass);

        exists.changePassword(Password.fromHash(newHash));

        await this.userRepository.save(exists);

        const returnUser: UserResponseDto = {
            id: exists.id,
            email: exists.getEmail(),
            status: exists.getStatus(),
            created_at: exists.getCreatedAt(),
        }

        return returnUser;
    }
}
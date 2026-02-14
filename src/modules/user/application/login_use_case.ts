import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {PasswordHasher} from "./ports/password_hasher_interface.js";
import {Email} from "../domain/email.js";
import {UserNotFound} from "../errors/user_repository_errors.js";
import {InvalidCredentialsError} from "../errors/login_errors.js";
import {UserResponseDto} from "../DTO/user_response_dto.js";


export class LoginUseCase {
    constructor(private readonly userRepo: UserRepository,
                private readonly passwordHasher: PasswordHasher
    ) {}

    async execute(email: string, plainPass: string) {
        const emailVerified = Email.create(email);
        const user = await this.userRepo.findByEmail(emailVerified);
        if (!user) {
            throw new UserNotFound();
        }
        const isValid = await this.passwordHasher.compare(plainPass, user.getPasswordHash());
        if (!isValid) {
            throw new InvalidCredentialsError();
        }
        const forReturn: UserResponseDto = {
            id: user.id,
            email: user.getEmail().getValue(),
            status: user.getStatus(),
            created_at: user.getCreatedAt(),
        }
        return forReturn;
    }
}
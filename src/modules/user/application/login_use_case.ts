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

    private async userExists(email: Email) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new UserNotFound();
        }
        return user;
    }

    private async checkPassword(plain: string, hash: string) {
        const isValid = await this.passwordHasher.compare(plain, hash);
        if (!isValid) {
            throw new InvalidCredentialsError();
        }
    }

    async execute(email: string, plainPass: string) {
        const emailVerified = Email.create(email);

        const user = await this.userExists(emailVerified);

        user.checkUserStatus(user.getStatus());

        await this.checkPassword(plainPass, user.getPasswordHash());

        const forReturn: UserResponseDto = {
            id: user.id,
            email: user.getEmail().getValue(),
            status: user.getStatus(),
            created_at: user.getCreatedAt(),
        }
        return forReturn;
    }
}
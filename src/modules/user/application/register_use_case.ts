import {UserRepository} from "../domain/ports/user_repo_interface.js";
import {User} from "../domain/user_domain.js";
import {Password} from "../domain/password.js";
import {PasswordHasher} from "./ports/password_hasher_interface.js";
import {UserResponseDto} from "../DTO/user_response_dto.js";
import {Email} from "../domain/email.js";
import {UserAlreadyExistsError} from "../errors/user_repository_errors.js";


export class RegisterUseCase {
    constructor(private userRepository: UserRepository,
                private readonly hasher: PasswordHasher,
    ){}

    async execute(email: string, plainPass: string) {
        const emailVerified = Email.create(email);

        const existingUser = await this.userRepository.findByEmail(emailVerified);
        if (existingUser) throw new UserAlreadyExistsError();

        const verifiedPassword = Password.validatePlain(plainPass);
        const passwordHash = await this.hasher.hash(verifiedPassword);

        const user = User.create(emailVerified, Password.fromHash(passwordHash));

        await this.userRepository.save(user);

        const returnUser: UserResponseDto = {
            id: user.id,
            email: user.getEmail(),
            status: user.getStatus(),
            created_at: user.getCreatedAt(),
        }

        return returnUser;
    }
}
import { RegisterUseCase } from "../../../src/modules/user/application/register_use_case.js";
import { UserRepository } from "../../../src/modules/user/domain/ports/user_repo_interface.js";
import { PasswordHasher } from "../../../src/modules/user/application/ports/password_hasher_interface.js";
import { User } from "../../../src/modules/user/domain/user_domain.js";
import { Email } from "../../../src/modules/user/domain/email.js";
import { Password } from "../../../src/modules/user/domain/password.js";
import {UserAlreadyExistsError} from "../../../src/modules/user/errors/user_repository_errors.js";
import {UserStatus} from "../../../src/modules/user/domain/user_status.js";

describe('RegisterUseCase', () => {

    let userRepository: jest.Mocked<UserRepository>;
    let hasher: jest.Mocked<PasswordHasher>;
    let useCase: RegisterUseCase;

    beforeEach(() => {
        userRepository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
        };

        hasher = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        useCase = new RegisterUseCase(userRepository, hasher);
    });

    it('should register new user successfully', async () => {
        userRepository.findByEmail.mockResolvedValue(null);
        hasher.hash.mockResolvedValue('hashed-password');

        const result = await useCase.execute(
            'test@example.com',
            'StrongPass1!'
        );

        expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(hasher.hash).toHaveBeenCalledWith('StrongPass1!');
        expect(userRepository.save).toHaveBeenCalledTimes(1);

        expect(result.email).toBe('test@example.com');
        expect(result.status).toBe(UserStatus.ACTIVE);
    });

    it('should throw error if user already exists', async () => {
        userRepository.findByEmail.mockResolvedValue(
            User.create(
                Email.create('test@example.com'),
                Password.fromHash('hash')
            )
        );

        await expect(
            useCase.execute('test@example.com', 'StrongPass1!')
        ).rejects.toThrow(UserAlreadyExistsError);

        expect(hasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should not hash password if email is invalid', async () => {
        await expect(
            useCase.execute('invalid-email', 'StrongPass1!')
        ).rejects.toThrow();

        expect(hasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should not save user if password is invalid', async () => {
        await expect(
            useCase.execute('test@example.com', 'weak')
        ).rejects.toThrow();

        expect(hasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

});

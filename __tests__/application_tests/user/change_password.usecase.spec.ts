import { ChangePasswordUseCase } from "../../../src/modules/user/application/change_pass_use_case.js";
import { UserRepository } from "../../../src/modules/user/domain/ports/user_repo_interface.js";
import { PasswordHasher } from "../../../src/modules/user/application/ports/password_hasher_interface.js";
import { User } from "../../../src/modules/user/domain/user_domain.js";
import { Email } from "../../../src/modules/user/domain/email.js";
import { Password } from "../../../src/modules/user/domain/password.js";
import {UserNotFound} from "../../../src/modules/user/errors/user_repository_errors.js";
import {InvalidPasswordError} from "../../../src/modules/user/errors/password_domain_errors.js";
import {UserIsBannedError} from "../../../src/modules/user/errors/user_domain_error.js";
import {UserStatus} from "../../../src/modules/user/domain/user_status.js";

describe('ChangePasswordUseCase', () => {

    let userRepository: jest.Mocked<UserRepository>;
    let hasher: jest.Mocked<PasswordHasher>;
    let useCase: ChangePasswordUseCase;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            save: jest.fn(),
        };

        hasher = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        useCase = new ChangePasswordUseCase(userRepository, hasher);
    });

    /**
     * CASE 1
     * Happy path
     */
    it('should change password successfully', async () => {
        const user = User.create(
            Email.create('test@example.com'),
            Password.fromHash('old-hash')
        );

        userRepository.findById.mockResolvedValue(user);
        hasher.compare.mockResolvedValue(true);
        hasher.hash.mockResolvedValue('new-hash');

        const result = await useCase.execute(
            user.id,
            'oldPlainPassword',
            'NewStrongPass1!'
        );

        expect(hasher.compare).toHaveBeenCalledWith(
            'oldPlainPassword',
            'old-hash'
        );

        expect(hasher.hash).toHaveBeenCalledWith('NewStrongPass1!');
        expect(userRepository.save).toHaveBeenCalledWith(user);

        expect(user.getPasswordHash()).toBe('new-hash');
        expect(result.status).toBe(UserStatus.ACTIVE);
    });

    /**
     * CASE 2
     * User not found
     */
    it('should throw error if user does not exist', async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('missing-id', 'old', 'NewStrongPass1!')
        ).rejects.toThrow(UserNotFound);

        expect(hasher.compare).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    /**
     * CASE 3
     * Invalid current password
     */
    it('should throw error if current password is invalid', async () => {
        const user = User.create(
            Email.create('test@example.com'),
            Password.fromHash('old-hash')
        );

        userRepository.findById.mockResolvedValue(user);
        hasher.compare.mockResolvedValue(false);

        await expect(
            useCase.execute(user.id, 'wrongOld', 'NewStrongPass1!')
        ).rejects.toThrow(InvalidPasswordError);

        expect(hasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    /**
     * CASE 4
     * Invalid new password
     */
    it('should throw error if new password is invalid', async () => {
        const user = User.create(
            Email.create('test@example.com'),
            Password.fromHash('old-hash')
        );

        userRepository.findById.mockResolvedValue(user);
        hasher.compare.mockResolvedValue(true);

        await expect(
            useCase.execute(user.id, 'oldPlain', 'weak')
        ).rejects.toThrow();

        expect(hasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    /**
     * CASE 5
     * Banned user cannot change password
     */
    it('should not allow banned user to change password', async () => {
        const bannedUser = new User(
            'user-id',
            Email.create('test@example.com'),
            Password.fromHash('old-hash'),
            UserStatus.BANNED,
            new Date()
        );

        userRepository.findById.mockResolvedValue(bannedUser);
        hasher.compare.mockResolvedValue(true);
        hasher.hash.mockResolvedValue('new-hash');

        await expect(
            useCase.execute('user-id', 'oldPlain', 'NewStrongPass1!')
        ).rejects.toThrow(UserIsBannedError);

        expect(userRepository.save).not.toHaveBeenCalled();
    });

    /**
     * CASE 6
     * Hasher throws error
     */
    it('should propagate error if hasher fails', async () => {
        const user = User.create(
            Email.create('test@example.com'),
            Password.fromHash('old-hash')
        );

        userRepository.findById.mockResolvedValue(user);
        hasher.compare.mockResolvedValue(true);
        hasher.hash.mockRejectedValue(new Error('Hashing failed'));

        await expect(
            useCase.execute(user.id, 'oldPlain', 'NewStrongPass1!')
        ).rejects.toThrow('Hashing failed');

        expect(userRepository.save).not.toHaveBeenCalled();
    });

});

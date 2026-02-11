import { ChangeUserEmailUseCase } from "../../../src/modules/user/application/change_user_email_use_case.js";
import { UserRepository } from "../../../src/modules/user/domain/ports/user_repo_interface.js";
import { User } from "../../../src/modules/user/domain/user_domain.js";
import { Email } from "../../../src/modules/user/domain/email.js";
import { Password } from "../../../src/modules/user/domain/password.js";
import {UserNotFound} from "../../../src/modules/user/errors/user_repository_errors.js";
import {UserStatus} from "../../../src/modules/user/domain/user_status.js";

describe('ChangeUserEmailUseCase', () => {

    let userRepository: jest.Mocked<UserRepository>;
    let useCase: ChangeUserEmailUseCase;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(), // даже если не используется — интерфейс требует
            save: jest.fn(),
        };

        useCase = new ChangeUserEmailUseCase(userRepository);
    });

    /**
     * CASE 1
     * Happy path
     */
    it('should change user email successfully', async () => {
        const user = User.create(
            Email.create('old@example.com'),
            Password.fromHash('hash')
        );

        userRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute(
            user.id,
            'new@example.com'
        );

        expect(userRepository.findById).toHaveBeenCalledWith(user.id);
        expect(userRepository.save).toHaveBeenCalledWith(user);

        expect(result.email.getValue()).toBe('new@example.com');
        expect(result.status).toBe(UserStatus.ACTIVE);
    });

    /**
     * CASE 2
     * User not found
     */
    it('should throw error if user does not exist', async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('missing-id', 'new@example.com')
        ).rejects.toThrow(UserNotFound);

        expect(userRepository.save).not.toHaveBeenCalled();
    });

    /**
     * CASE 3
     * Invalid email
     */
    it('should throw error if new email is invalid', async () => {
        const user = User.create(
            Email.create('old@example.com'),
            Password.fromHash('hash')
        );

        userRepository.findById.mockResolvedValue(user);

        await expect(
            useCase.execute(user.id, 'invalid-email')
        ).rejects.toThrow();

        expect(userRepository.save).not.toHaveBeenCalled();
    });

    /**
     * CASE 4
     * Banned user cannot change email
     */
    it('should not allow banned user to change email', async () => {
        const bannedUser = new User(
            'user-id',
            Email.create('old@example.com'),
            Password.fromHash('hash'),
            UserStatus.BANNED,
            new Date()
        );

        userRepository.findById.mockResolvedValue(bannedUser);

        await expect(
            useCase.execute('user-id', 'new@example.com')
        ).rejects.toThrow('User is banned');

        expect(userRepository.save).not.toHaveBeenCalled();
    });

});

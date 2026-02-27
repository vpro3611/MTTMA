import {User} from "../../../backend/src/modules/user/domain/user_domain.js";
import {Email} from "../../../backend/src/modules/user/domain/email.js";
import {Password} from "../../../backend/src/modules/user/domain/password.js";
import {UserIsBannedError} from "../../../backend/src/modules/user/errors/user_domain_error.js";
import {UserStatus} from "../../../backend/src/modules/user/domain/user_status.js";

describe('User (domain)', () => {

    const validEmail = Email.create('test@example.com');
    const validPassword = Password.fromHash('hashed-password');

    /**
     * CASE 1
     * create → active user
     */
    it('should create user with active status', () => {
        const user = User.create(validEmail, validPassword);

        expect(user.getStatus()).toBe(UserStatus.ACTIVE);
    });

    /**
     * CASE 2
     * active user can change email
     */
    it('should allow active user to change email', () => {
        const user = User.create(validEmail, validPassword);
        const newEmail = Email.create('new@example.com');

        user.changeEmail(newEmail);

        expect(user.getEmail().getValue()).toBe('new@example.com');
    });

    /**
     * CASE 3
     * active user can change password
     */
    it('should allow active user to change password', () => {
        const user = User.create(validEmail, validPassword);
        const newPassword = Password.fromHash('new-hash');

        user.changePassword(newPassword);

        expect(user.getPasswordHash()).toBe('new-hash');
    });

    /**
     * CASE 4
     * banned user cannot change email
     */
    it('should not allow banned user to change email', () => {
        const user = new User(
            'user-id',
            validEmail,
            validPassword,
            UserStatus.BANNED,
            new Date()
        );

        const newEmail = Email.create('blocked@example.com');

        expect(() => {
            user.changeEmail(newEmail);
        }).toThrow(UserIsBannedError);
    });

    /**
     * CASE 5
     * banned user cannot change password
     */
    it('should not allow banned user to change password', () => {
        const user = new User(
            'user-id',
            validEmail,
            validPassword,
            UserStatus.BANNED,
            new Date()
        );

        const newPassword = Password.fromHash('new-hash');

        expect(() => {
            user.changePassword(newPassword);
        }).toThrow(UserIsBannedError);
    });

    /**
     * CASE 6
     * suspended user CAN change email (current behavior)
     *
     * ⚠️ Этот тест очень важен:
     * он фиксирует текущее бизнес-правило,
     * даже если позже ты решишь его изменить.
     */
    it('should allow suspended user to change email', () => {
        const user = new User(
            'user-id',
            validEmail,
            validPassword,
            UserStatus.SUSPENDED,
            new Date()
        );

        const newEmail = Email.create('suspended@example.com');

        user.changeEmail(newEmail);

        expect(user.getEmail().getValue()).toBe('suspended@example.com');
    });

});

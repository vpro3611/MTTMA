import { Pool } from "pg";
import { UserRepositoryPG } from "../../../backend/src/modules/user/repository_realization/user_repository_pg.js";
import { User } from "../../../backend/src/modules/user/domain/user_domain.js";
import { Email } from "../../../backend/src/modules/user/domain/email.js";
import { Password } from "../../../backend/src/modules/user/domain/password.js";
import {UserStatus} from "../../../backend/src/modules/user/domain/user_status.js";

describe('UserRepositoryPG (integration)', () => {

    let poolT: Pool;
    let repo: UserRepositoryPG;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Must be in test environment');
        }

        // ⬇️ отдельный pool только для тестов
        poolT = new Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });

        repo = new UserRepositoryPG(poolT);
    });

    beforeEach(async () => {
        await poolT.query('BEGIN');
    });

    afterEach(async () => {
        await poolT.query('ROLLBACK');
    });

    afterAll(async () => {
        await poolT.end();
    });

    it('should save user and retrieve it by id', async () => {
        const user = new User(
            crypto.randomUUID(),
            Email.create('test1@example.com'),
            Password.fromHash('password123'),
            UserStatus.ACTIVE,
            new Date()
        );

        await repo.save(user);

        const result = await repo.findById(user.id);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(user.id);
        expect(result!.getEmail().getValue()).toBe('test1@example.com');
        expect(result!.getStatus()).toBe(UserStatus.ACTIVE);
    });

    it('should return null when user is not found by id', async () => {
        const result = await repo.findById(crypto.randomUUID());
        expect(result).toBeNull();
    });

    it('should find user by email', async () => {
        const user = new User(
            crypto.randomUUID(),
            Email.create('test2@example.com'),
            Password.fromHash('password123'),
            UserStatus.ACTIVE,
            new Date()
        );

        await repo.save(user);

        const result = await repo.findByEmail(
            Email.create('test2@example.com')
        );

        expect(result).not.toBeNull();
        expect(result!.id).toBe(user.id);
    });

    it('should return null when user is not found by email', async () => {
        const result = await repo.findByEmail(
            Email.create('absent@example.com')
        );

        expect(result).toBeNull();
    });

    it('should update existing user on save (upsert by id)', async () => {
        const id = crypto.randomUUID();

        const user = new User(
            id,
            Email.create('old@example.com'),
            Password.fromHash('oldpassword'),
            UserStatus.ACTIVE,
            new Date()
        );

        await repo.save(user);

        const updated = new User(
            id,
            Email.create('new@example.com'),
            Password.fromHash('newpassword'),
            UserStatus.BANNED,
            user.getCreatedAt()
        );

        await repo.save(updated);

        const result = await repo.findById(id);

        expect(result!.getEmail().getValue()).toBe('new@example.com');
        expect(result!.getStatus()).toBe(UserStatus.BANNED);
    });

    it('should fail when saving user with duplicate email', async () => {
        const user1 = new User(
            crypto.randomUUID(),
            Email.create('unique@example.com'),
            Password.fromHash('password123'),
            UserStatus.ACTIVE,
            new Date()
        );

        const user2 = new User(
            crypto.randomUUID(),
            Email.create('unique@example.com'),
            Password.fromHash('password456'),
            UserStatus.ACTIVE,
            new Date()
        );

        await repo.save(user1);

        await expect(
            repo.save(user2)
        ).rejects.toThrow();
    });
});

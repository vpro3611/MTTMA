import {pool} from "../../src/db/pg_pool.js";
import {Pool} from "pg";
import {UserRepositoryPG} from "../../src/modules/user/repository_realization/user_repository_pg.js";
import {User} from "../../src/modules/user/domain/user_domain.js";
import {Email} from "../../src/modules/user/domain/email.js";
import {Password} from "../../src/modules/user/domain/password.js";

describe('UserRepositoryPG (integration)', () => {

    let poolT: Pool;
    let repo: UserRepositoryPG;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Must be in test environment');
        }

        poolT = pool;

        repo = new UserRepositoryPG(poolT);
    });

    afterEach(async () => {
        // важно: порядок из-за FK
        await poolT.query('TRUNCATE TABLE users CASCADE');
    });

    afterAll(async () => {
        await poolT.end();
    });

    /**
     * CASE 1
     * save → findById
     * Базовый happy-path репозитория
     */
    it('should save user and retrieve it by id', async () => {
        const user = new User(
            crypto.randomUUID(),
            Email.create('test1@example.com'),
            Password.fromHash('password123'),
            'active',
            new Date()
        );

        await repo.save(user);

        const result = await repo.findById(user.id);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(user.id);
        expect(result!.getEmail().getValue()).toBe('test1@example.com');
        expect(result!.getStatus()).toBe('active');
    });

    /**
     * CASE 2
     * findById → null если пользователя нет
     */
    it('should return null when user is not found by id', async () => {
        const result = await repo.findById(crypto.randomUUID());
        expect(result).toBeNull();
    });

    /**
     * CASE 3
     * save → findByEmail
     */
    it('should find user by email', async () => {
        const user = new User(
            crypto.randomUUID(),
            Email.create('test2@example.com'),
            Password.fromHash('password123'),
            'active',
            new Date()
        );

        await repo.save(user);

        const result = await repo.findByEmail(
            Email.create('test2@example.com')
        );

        expect(result).not.toBeNull();
        expect(result!.id).toBe(user.id);
    });

    /**
     * CASE 4
     * findByEmail → null если email отсутствует
     */
    it('should return null when user is not found by email', async () => {
        const result = await repo.findByEmail(
            Email.create('absent@example.com')
        );

        expect(result).toBeNull();
    });

    /**
     * CASE 5
     * save делает UPDATE при конфликте по id
     * (upsert semantics)
     */
    it('should update existing user on save (upsert by id)', async () => {
        const id = crypto.randomUUID();

        const user = new User(
            id,
            Email.create('old@example.com'),
            Password.fromHash('oldpassword'),
            'active',
            new Date()
        );

        await repo.save(user);

        const updated = new User(
            id,
            Email.create('new@example.com'),
            Password.fromHash('newpassword'),
            'banned',
            user.getCreatedAt()
        );

        await repo.save(updated);

        const result = await repo.findById(id);

        expect(result!.getEmail().getValue()).toBe('new@example.com');
        expect(result!.getStatus()).toBe('banned');
    });

    /**
     * CASE 6
     * email UNIQUE constraint
     * Репозиторий не должен молча перезаписывать другого пользователя
     */
    it('should fail when saving user with duplicate email', async () => {
        const user1 = new User(
            crypto.randomUUID(),
            Email.create('unique@example.com'),
            Password.fromHash('password123'),
            'active',
            new Date()
        );

        const user2 = new User(
            crypto.randomUUID(),
            Email.create('unique@example.com'),
            Password.fromHash('password456'),
            'active',
            new Date()
        );

        await repo.save(user1);

        await expect(
            repo.save(user2)
        ).rejects.toThrow();
    });
});

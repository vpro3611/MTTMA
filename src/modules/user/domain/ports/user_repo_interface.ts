import {User} from "../user_domain.js";
import {Email} from "../email.js";

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    save(user: User): Promise<void>;
}

import {UserRepositoryPG} from "./modules/user/repository_realization/user_repository_pg.js";
import {pool} from "./db/pg_pool.js";
import {HasherBcrypt} from "@/modules/user/infrastructure/hasher_bcrypt.js";
import {PasswordHasher} from "@/modules/user/application/ports/password_hasher_interface.js";
import {ChangePasswordUseCase} from "@/modules/user/application/change_pass_use_case.js";
import {ChangeUserEmailUseCase} from "@/modules/user/application/change_user_email_use_case.js";
import {RegisterUseCase} from "@/modules/user/application/register_use_case.js";

export function assembleContainer() {
    // repositories
    const userRepoPG = new UserRepositoryPG(pool);

    // infrastructure services
    const hasher: PasswordHasher = new HasherBcrypt();

    // use cases (application services);
    const changePassUC = new ChangePasswordUseCase(userRepoPG, hasher);
    const changeEmailUC = new ChangeUserEmailUseCase(userRepoPG);
    const registerUC = new RegisterUseCase(userRepoPG, hasher);


}
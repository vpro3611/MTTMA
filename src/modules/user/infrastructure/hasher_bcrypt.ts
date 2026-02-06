import {PasswordHasher} from "../application/ports/password_hasher_interface.js";
import * as bcrypt from "bcrypt";


export class HasherBcrypt implements PasswordHasher{
    constructor(private readonly saltRounds: number = 12) {}

    hash = async (plain: string) => {
        return await bcrypt.hash(plain, this.saltRounds);
    }

    compare = async (plain: string, hash: string) => {
        return await bcrypt.compare(plain, hash);
    }
}
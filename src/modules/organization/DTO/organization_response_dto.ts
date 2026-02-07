import {Name} from "../domain/name.js";


export type OrganizationResponseDto = {
    id: string,
    name: Name,
    createdAt: Date,
}
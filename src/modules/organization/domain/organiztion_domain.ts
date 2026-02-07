import {Name} from "./name.js";


export class Organization {
     constructor(
        public readonly id: string,
        private name: Name,
        private readonly createdAt: Date,
    ){}

    static create(name: Name) {
        return new Organization(
            crypto.randomUUID(),
            name,
            new Date()
        )
    }

    rename = (newName: Name) => {
        this.name = newName;
    }

    getName = () => this.name;

    getCreatedAt = () => this.createdAt;
}
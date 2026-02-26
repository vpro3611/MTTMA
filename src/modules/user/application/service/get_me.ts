import {GetMeUseCase} from "../get_me_use_case.js";


export class GetMeService {
    constructor(private readonly getMeUseCase: GetMeUseCase) {}

    async executeTx(actorId: string) {
        const user = await this.getMeUseCase.execute(actorId);
        return user;
    }
}
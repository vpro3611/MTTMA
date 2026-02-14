import {AppContainer, assembleContainer} from "./container.js";
import {createApp} from "./app.js";


export async function startServer() {
    const dependencies: AppContainer = assembleContainer();

    const app = createApp(dependencies);

    const port = process.env.PORT || 3333;

    app.listen(port, () => console.log(`Server listening on port ${port}`));
}
import express from 'express';
import {AppContainer} from "./container.js";
import {createAuthMiddleware} from "./Auth/auth_middleware/auth_middleware.js";


export function createApp(dependencies: AppContainer) {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.get('/', (req, res) => {
        res.send('Hello World!').status(200);
    })

    const publicRouter = express.Router();
    const privateRouter = express.Router();
    app.use('/pub', publicRouter);
    app.use('/api', privateRouter);

    privateRouter.use(createAuthMiddleware(dependencies.jwtTokenService));

    publicRouter.post('/register', dependencies.authController.register);
    publicRouter.post('/login', dependencies.authController.login);
    publicRouter.post('/refresh', dependencies.authController.refresh);

    privateRouter.post('/logout', dependencies.authController.logout);

    return app;
}
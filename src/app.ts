import express from 'express';
import {AppContainer} from "./container.js";
import {createAuthMiddleware} from "./Auth/auth_middleware/auth_middleware.js";
import {errorMiddleware} from "./middlewares/error_middleware.js";
import {loggerMiddleware} from "./middlewares/logger_middleware.js";
import cookieParser from "cookie-parser";
import {validateZodMiddleware} from "./middlewares/validate_zod_middleware.js";
import {ChangeEmailSchema} from "./modules/user/controller/change_email_controller.js"
import {ChangePassSchema} from "./modules/user/controller/change_pass_controller.js";
import {LoginSchema, RegisterSchema} from "./Auth/auth_controller/auth_controller.js";
import {validate_params} from "./middlewares/validate_params.js";
import {
    ChangeDescBodySchema,
    ChangeDescParamsSchema
} from "./modules/organization_task/controller/change_desc_controller.js";
import {ChangeTitleParamsSchema} from "./modules/organization_task/controller/change_title_controller.js";
import {
    CreateTaskBodySchema,
    CreateTaskParamsSchema
} from "./modules/organization_task/controller/create_task_controller.js";
import {DeleteTaskParamsSchema} from "./modules/organization_task/controller/delete_task_controller.js";


export function createApp(dependencies: AppContainer) {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser())

    app.get('/', (req, res) => {
        res.send('Hello World!').status(200);
    })

    const publicRouter = express.Router();
    const privateRouter = express.Router();
    const organizationRouter = express.Router();
    app.use('/pub', publicRouter);
    app.use('/me', privateRouter);
    app.use('/org', organizationRouter);

    privateRouter.use(createAuthMiddleware(dependencies.jwtTokenService));

    publicRouter.post('/register',
        validateZodMiddleware(RegisterSchema),
        dependencies.authController.register
    );

    publicRouter.post('/login',
        validateZodMiddleware(LoginSchema),
        dependencies.authController.login
    );

    publicRouter.post('/refresh',
        dependencies.authController.refresh
    );

    privateRouter.post('/logout',
        dependencies.authController.logout
    );

    privateRouter.patch('/change_pass',
        validateZodMiddleware(ChangePassSchema),
        dependencies.changePasswordController.changePassCont
    );

    privateRouter.patch('/change_email',
        validateZodMiddleware(ChangeEmailSchema),
        dependencies.changeEmailController.changeEmailCont
    );

    organizationRouter.patch('/:orgId/tasks/:taskId/description',
        validate_params(ChangeDescParamsSchema),
        validateZodMiddleware(ChangeDescBodySchema),
        dependencies.changeTaskDescController.changeDescCont
    );

    organizationRouter.patch('/:orgId/tasks/:taskId/status',
        validate_params(ChangeDescParamsSchema),
        validateZodMiddleware(ChangeDescBodySchema),
        dependencies.changeTaskStatusController.changeStatusCont
    );

    organizationRouter.patch('/:orgId/tasks/:taskId/title',
        validate_params(ChangeTitleParamsSchema),
        validateZodMiddleware(ChangeDescBodySchema),
        dependencies.changeTaskTitleController.changeTitleCont
    );

    organizationRouter.post('/:orgId/tasks/create',
        validate_params(CreateTaskParamsSchema),
        validateZodMiddleware(CreateTaskBodySchema),
        dependencies.createTaskController.createTaskCont
    );

    organizationRouter.delete('/:orgId/tasks/:taskId',
        validate_params(DeleteTaskParamsSchema),
        dependencies.deleteTaskController.deleteTaskCont
    );

    app.use(loggerMiddleware());
    app.use(errorMiddleware());

    return app;
}
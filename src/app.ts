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
import {CreateOrgBodySchema} from "./modules/organization/controllers/create_organization_controller.js";
import {
    RenameOrgBodySchema,
    RenameOrgParamsSchema
} from "./modules/organization/controllers/rename_organization_controller.js";
import {DeleteOrganizationParamsSchema} from "./modules/organization/controllers/delete_organization_controller.js";
import {
    ChangeRoleBodySchema,
    ChangeRoleParamsSchema
} from "./modules/organization_members/controllers/change_role_controller.js";
import {FireMemberParamsSchema} from "./modules/organization_members/controllers/fire_member_controller.js";
import {
    HireMemberBodySchema,
    HireMemberParamsSchema
} from "./modules/organization_members/controllers/hire_member_controller.js";
import {GetAuditByOrgIdParamsSchema} from "./modules/audit_events/controllers/get_audit_by_org_id_controller.js";
import {GetFilteredAuditParamsSchema} from "./modules/audit_events/controllers/get_filtered_audit_controller.js";
import {validateQuery} from "./middlewares/validateQuery.js";
import {CheckProfileParamsSchema} from "./modules/user/controller/check_profile_controller.js";
import {GetAllMembersParamsSchema} from "./modules/organization_members/controllers/get_all_members_controller.js";
import {AcceptInvitationParamsSchema} from "./modules/invitations/controllers/accept_invitation_controller.js";
import {RejectInvitationParamsSchema} from "./modules/invitations/controllers/reject_invitation_controller.js";
import {CancelInvitationParamsSchema} from "./modules/invitations/controllers/cancel_invitation_controller.js";
import {
    CreateInvitationBodySchema,
    CreateInvitationParamsSchema
} from "./modules/invitations/controllers/create_invitation_controller.js";
import {
    GetOrganizationInvitationsParamsSchema
} from "./modules/invitations/controllers/get_organization_invitations_controller.js";
import {
    ViewOrganizationParams,
    ViewOrganizationParamsSchema
} from "./modules/organization/controllers/view_organization_controller.js";


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
    organizationRouter.use(createAuthMiddleware(dependencies.jwtTokenService));

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

    privateRouter.get('/:targetUserId',
        validate_params(CheckProfileParamsSchema),
        dependencies.checkProfileController.checkProfileCont
    );

    privateRouter.get('/organizations',
        dependencies.searchOrganizationController.searchOrganizationCont
    );

    privateRouter.get("/organizations/:orgId",
        validate_params(ViewOrganizationParamsSchema),
        dependencies.viewOrganizationController.viewOrganizationCont
    );

    privateRouter.patch('/:invitationId/accept',
        validate_params(AcceptInvitationParamsSchema),
        dependencies.acceptInvitationController.acceptInvitationCont  // ACCEPT INVITATION
    );

    privateRouter.patch("/:invitationId/reject",
        validate_params(RejectInvitationParamsSchema),
        dependencies.rejectInvitationController.rejectInvitationCont // REJECT INVITATION
    );

    privateRouter.get("/invitations",
        dependencies.viewUserInvitationsController.viewUserInvitationsCont
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

    organizationRouter.post("/create",
        validateZodMiddleware(CreateOrgBodySchema),
        dependencies.createOrganizationController.createOrganizationCont
    );

    organizationRouter.patch("/:orgId/rename",
        validate_params(RenameOrgParamsSchema),
        validateZodMiddleware(RenameOrgBodySchema),
        dependencies.renameOrganizationController.renameOrgCont
    );

    organizationRouter.delete("/:orgId/delete",
        validate_params(DeleteOrganizationParamsSchema),
        dependencies.deleteOrganizationController.DeleteOrganizationCont
    );

    organizationRouter.patch("/:orgId/role/:targetUserId",
        validate_params(ChangeRoleParamsSchema),
        validateZodMiddleware(ChangeRoleBodySchema),
        dependencies.changeMemberRoleController.changeRoleCont
    );

    organizationRouter.delete("/:orgId/fire/:targetUserId",
        validate_params(FireMemberParamsSchema),
        dependencies.fireMemberController.fireMemberCont
    );

    organizationRouter.post("/:orgId/hire",
        validate_params(HireMemberParamsSchema),
        validateZodMiddleware(HireMemberBodySchema),
        dependencies.hireMemberController.hireMemberCont
    );

    organizationRouter.get("/:orgId/members",
        validate_params(GetAllMembersParamsSchema),
        dependencies.getAllMembersController.getAllMembersCont
    );

    organizationRouter.get("/:orgId/audit_events/all",
        validate_params(GetAuditByOrgIdParamsSchema),
        dependencies.getAuditByOrgIdController.getAuditByOrgIdCont
    );

    organizationRouter.get("/:orgId/audit_events/filtered",
        validate_params(GetFilteredAuditParamsSchema),
        // validateQuery(GetFilteredAuditParamsSchema),
        dependencies.getFilteredAuditController.getFilteredAuditCont
    );

    organizationRouter.post("/:orgId/invite/:invitedUserId",
        validate_params(CreateInvitationParamsSchema),
        validateZodMiddleware(CreateInvitationBodySchema),
        dependencies.createInvitationController.createInvitationCont // CREATE INVITATION FOR TARGET (invitedUserId) USER
    );

    organizationRouter.get("/:orgId/invitations",
        validate_params(GetOrganizationInvitationsParamsSchema),
        dependencies.getOrganizationInvitationsController.getOrganizationInvitationsCont // GET INVITATIONS OF A SPECIFIC ORGANIZATION
    );

    organizationRouter.patch("/:invitationId/cancel",
        validate_params(CancelInvitationParamsSchema),
        dependencies.cancelInvitationController.cancelInvitationCont // CANCEL INVITATION
    );

    app.use(loggerMiddleware());
    app.use(errorMiddleware());

    return app;
}
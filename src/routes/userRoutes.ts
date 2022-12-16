import { UserController } from "../controller/UserController";
import { UserAccess } from "../Middleware/UserAccess";

export const userRoutes = [{
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
    middleware: UserAccess.canGetCollection
}, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
    middleware: UserAccess.canGet
}, {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "save",
    middleware: UserAccess.canCreate
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
    middleware: UserAccess.canRemove
}, {
    method: "put",
    route: "/users/:id",
    controller: UserController,
    action: "update",
    middleware: UserAccess.canUpdate
}]
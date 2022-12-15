import { ClientController } from "../controller/ClientController";

export const clientRoutes = [{
    method: "get",
    route: "/clients",
    controller: ClientController,
    action: "all"
}, {
    method: "get",
    route: "/clients/:id",
    controller: ClientController,
    action: "one"
}, {
    method: "post",
    route: "/clients",
    controller: ClientController,
    action: "save"
}, {
    method: "delete",
    route: "/clients/:id",
    controller: ClientController,
    action: "remove"
}, {
    method: "put",
    route: "/clients/:id",
    controller: ClientController,
    action: "update"
}]
import { SousAgenceController } from "../controller/SousAgenceController";

export const sousAgenceRoutes = [{
    method: "get",
    route: "/sous-agences",
    controller: SousAgenceController,
    action: "all"
}, {
    method: "get",
    route: "/sous-agences/agence/:idAgence",
    controller: SousAgenceController,
    action: "allFromOneAgence"
}, {
    method: "get",
    route: "/sous-agences/:id",
    controller: SousAgenceController,
    action: "one"
}, {
    method: "post",
    route: "/sous-agences",
    controller: SousAgenceController,
    action: "save"
}, {
    method: "delete",
    route: "/sous-agences/:id",
    controller: SousAgenceController,
    action: "remove"
}, {
    method: "put",
    route: "/sous-agences/:id",
    controller: SousAgenceController,
    action: "update"
}, {
    method: "post",
    route: "/sous-agences/ajouter-utilisateur",
    controller: SousAgenceController,
    action: "addUser"
}]
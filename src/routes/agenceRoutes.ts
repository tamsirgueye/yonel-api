import { AgenceController } from "../controller/AgenceController"

export const agenceRoutes = [{
    method: "get",
    route: "/agences",
    controller: AgenceController,
    action: "all"
}, {
    method: "get",
    route: "/agences/:id",
    controller: AgenceController,
    action: "one"
}, {
    method: "post",
    route: "/agences",
    controller: AgenceController,
    action: "save"
}, {
    method: "delete",
    route: "/agences/:id",
    controller: AgenceController,
    action: "remove"
}, {
    method: "put",
    route: "/agences/:id",
    controller: AgenceController,
    action: "update"
}, {
    method: "post",
    route: "/agences/ajouter-utilisateur",
    controller: AgenceController,
    action: "addUser"
}]
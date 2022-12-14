import { AgenceController } from "../controller/AgenceController";

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
}]
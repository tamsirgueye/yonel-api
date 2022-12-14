import { SousAgenceController } from "../controller/SousAgenceController";

export const sousAgenceRoutes = [{
    method: "get",
    route: "/sous-agences/agence-:idAgence",
    controller: SousAgenceController,
    action: "all"
}, {
    method: "get",
    route: "/sous-agences/:id",
    controller: SousAgenceController,
    action: "one"
}, {
    method: "post",
    route: "/sous-agences/agence-:idAgence/ville-:idVille",
    controller: SousAgenceController,
    action: "save"
}, {
    method: "delete",
    route: "/sous-agences/:id",
    controller: SousAgenceController,
    action: "remove"
}]
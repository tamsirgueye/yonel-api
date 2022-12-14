import { VilleController } from "../controller/VilleController";

export const villeRoutes = [{
    method: "get",
    route: "/villes/pays-:idPays",
    controller: VilleController,
    action: "all"
}, {
    method: "get",
    route: "/villes/:id",
    controller: VilleController,
    action: "one"
}, {
    method: "post",
    route: "/villes/pays-:idPays",
    controller: VilleController,
    action: "save"
}, {
    method: "delete",
    route: "/villes/:id",
    controller: VilleController,
    action: "remove"
}]
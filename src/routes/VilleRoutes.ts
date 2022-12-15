import { VilleController } from "../controller/VilleController";

export const villeRoutes = [{
    method: "get",
    route: "/villes",
    controller: VilleController,
    action: "all"
}, {
    method: "get",
    route: "/villes/pays/:idPays",
    controller: VilleController,
    action: "allFromOnePays"
}, {
    method: "get",
    route: "/villes/:id",
    controller: VilleController,
    action: "one"
}, {
    method: "post",
    route: "/villes",
    controller: VilleController,
    action: "save"
}, {
    method: "delete",
    route: "/villes/:id",
    controller: VilleController,
    action: "remove"
}, {
    method: "put",
    route: "/villes/:id",
    controller: VilleController,
    action: "update"
}]
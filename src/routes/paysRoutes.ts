import { PaysController } from "../controller/PaysController";

export const paysRoutes = [{
    method: "get",
    route: "/pays",
    controller: PaysController,
    action: "all"
}, {
    method: "get",
    route: "/pays/:id",
    controller: PaysController,
    action: "one"
}, {
    method: "post",
    route: "/pays",
    controller: PaysController,
    action: "save"
}, {
    method: "delete",
    route: "/pays/:id",
    controller: PaysController,
    action: "remove"
}, {
    method: "put",
    route: "/pays/:id",
    controller: PaysController,
    action: "update"
}]
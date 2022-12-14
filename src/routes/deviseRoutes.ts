import { DeviseController } from "../controller/DeviseController";

export const deviseRoutes = [{
    method: "get",
    route: "/devises",
    controller: DeviseController,
    action: "all"
}, {
    method: "get",
    route: "/devises/:id",
    controller: DeviseController,
    action: "one"
}, {
    method: "post",
    route: "/devises",
    controller: DeviseController,
    action: "save"
}, {
    method: "delete",
    route: "/devises/:id",
    controller: DeviseController,
    action: "remove"
}]
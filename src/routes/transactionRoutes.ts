import { TransactionController } from "../controller/TransactionController";

export const transactionRoutes = [{
    method: "get",
    route: "/transactions",
    controller: TransactionController,
    action: "all"
}, {
    method: "get",
    route: "/transactions/client/:idClient",
    controller: TransactionController,
    action: "allFromOneClient"
}, {
    method: "get",
    route: "/transactions/:id",
    controller: TransactionController,
    action: "one"
}, {
    method: "post",
    route: "/transactions",
    controller: TransactionController,
    action: "save"
}, {
    method: "delete",
    route: "/transactions/:id",
    controller: TransactionController,
    action: "remove"
}, {
    method: "post",
    route: "/transactions/payer",
    controller: TransactionController,
    action: "pay"
}, {
    method: "put",
    route: "/transactions/annuler/:id",
    controller: TransactionController,
    action: "cancel"
}]
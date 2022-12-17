import { TransactionController } from "../controller/TransactionController";
import { TransactionAccess } from "../Middleware/TransactionAccess";

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
    action: "save",
    middleware: TransactionAccess.hasSousAgence
}, {
    method: "delete",
    route: "/transactions/:id",
    controller: TransactionController,
    action: "remove",
    middleware: TransactionAccess.hasSousAgence
}, {
    method: "post",
    route: "/transactions/payer",
    controller: TransactionController,
    action: "pay",
    middleware: TransactionAccess.hasSousAgence
}, {
    method: "put",
    route: "/transactions/annuler/:id",
    controller: TransactionController,
    action: "cancel",
    middleware: TransactionAccess.hasSousAgence
}]
import { userRoutes } from "./routes/userRoutes"
import { clientRoutes } from "./routes/clienRoutes";
import { transactionRoutes } from "./routes/transactionRoutes";
import { deviseRoutes } from "./routes/deviseRoutes";
import { paysRoutes } from "./routes/paysRoutes";
import { villeRoutes } from "./routes/villeRoutes";
import { agenceRoutes } from "./routes/agenceRoutes";
import { sousAgenceRoutes } from "./routes/sousAgenceRoutes";

export const Routes = [
    userRoutes,
    clientRoutes,
    transactionRoutes,
    deviseRoutes,
    paysRoutes,
    villeRoutes,
    agenceRoutes,
    sousAgenceRoutes
]
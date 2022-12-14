import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne} from "typeorm"
import { Client } from "./Client";
import { Paiement } from "./Paiement";
import { Devise } from "./Devise"
import { Pays } from "./Pays";

// DataTypeNotSupportedError: Data type "enum" in "Transaction.statut" is not supported by "sqlite" database.
/*export enum StatutTransaction {
    TRANSMITTED = "transmitted",
    PAYABLE = "payable",
    PAID = "paid",
    CANCELED = "cancelled",
}*/

@Entity()
export class Transaction {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    dateEnvoi: Date = new Date()

    @Column()
    montantReception: number

    @Column()
    frais: number

    @Column()
    montantTotal: number

    //@Column({ type: "enum", enum: StatutTransaction, default: StatutTransaction.TRANSMITTED })
    @Column()
    statut: string = 'transmitted'

    @ManyToOne(() => Client, (client) => client.transactions, { nullable: false })
    client: Client

    @OneToOne(() => Paiement, (paiement) => paiement.transaction, { cascade: true })
    paiement: Paiement

    @ManyToOne(() => Devise, (devise) => devise.transactions, { nullable: false })
    devise: Devise

    @ManyToOne(() => Pays, (pays) => pays.transactions, { nullable: false })
    pays: Pays

}

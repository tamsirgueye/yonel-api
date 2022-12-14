import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Transaction } from "./Transaction";

@Entity()
export class Paiement {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    date: Date = new Date()

    @Column()
    nomCompletRecepteur: string

    @Column()
    typePieceIdentite: string

    @Column()
    numeroPieceIdentite: string

    @OneToOne(() => Transaction, (transaction) => transaction.paiement)
    @JoinColumn()
    transaction: Transaction
}

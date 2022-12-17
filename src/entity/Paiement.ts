import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Transaction } from "./Transaction";

export enum TypePieceIdentite {
    CNI = "cni",
    PASSPORT = "passport",
    PERMIS = "permis"
}

@Entity()
export class Paiement {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    date: Date = new Date()

    @Column()
    nomCompletRecepteur: string

    @Column({ type: "enum", enum: TypePieceIdentite })
    typePieceIdentite: string

    @Column()
    numeroPieceIdentite: string

    @OneToOne(() => Transaction, (transaction) => transaction.paiement)
    @JoinColumn()
    transaction: Transaction
}

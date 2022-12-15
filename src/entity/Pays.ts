import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Transaction } from "./Transaction";
import { Ville } from "./Ville";

@Entity()
export class Pays {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    code: string

    @Column({ unique: true })
    nom: string

    @OneToMany(() => Transaction, (transaction) => transaction.paysOrigine)
    transactionsOrigine: Transaction[]

    @OneToMany(() => Transaction, (transaction) => transaction.paysDestination)
    transactionsDestination: Transaction[]

    @OneToMany(() => Ville, (ville) => ville.pays)
    villes: Ville[]
}

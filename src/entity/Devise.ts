import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Transaction } from "./Transaction";

@Entity()
export class Devise {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    code: string

    @Column({ unique: true })
    nom: string

    @Column({ unique: true })
    symbole: string

    @Column({ type: "float", precision: 3, scale: 3 })
    tauxConversion: number

    @Column({ type: "float", precision: 3, scale: 3 })
    tauxFrais: number

    @OneToMany(() => Transaction, (transaction) => transaction.deviseOrigine)
    transactionsOrigine: Transaction[]

    @OneToMany(() => Transaction, (transaction) => transaction.deviseDestination)
    transactionsDestination: Transaction[]

}

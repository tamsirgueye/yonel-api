import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Transaction } from "./Transaction"

@Entity()
export class Client {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    prenom: string

    @Column()
    nom: string

    @Column()
    dateNaissance: Date

    @Column()
    lieuNaissance: string

    @Column({ unique: true })
    email: string

    @Column()
    telephone: string

    @OneToMany(() => Transaction, transaction => transaction.client, { cascade: true })
    transactions: Transaction[]

}

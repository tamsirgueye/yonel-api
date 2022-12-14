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

    @OneToMany(() => Transaction, transaction => transaction.emetteur, { cascade: true })
    transactionsEmises: Transaction[]

    @OneToMany(() => Transaction, transaction => transaction.recepteur, { cascade: true })
    transactionsRecues: Transaction[]

}

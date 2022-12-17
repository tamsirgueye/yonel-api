import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { SousAgence } from "./SousAgence";
import { Transaction } from "./Transaction";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    login: string

    @Column({ select: false })
    password: string

    @ManyToOne(() => SousAgence, (sousAgence) => sousAgence.users)
    sousAgence: SousAgence

    @Column()
    isAdmin: boolean = false

    @OneToMany(() => Transaction, (transaction) => transaction.userCreateur)
    transactionsCrees: Transaction[]

}

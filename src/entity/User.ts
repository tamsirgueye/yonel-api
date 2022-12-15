import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Agence } from "./Agence";
import { SousAgence } from "./SousAgence";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    login: string

    @Column()
    password: string

    @ManyToOne(() => Agence, (agence) => agence.users)
    agence: Agence

    @ManyToOne(() => SousAgence, (sousAgence) => sousAgence.users)
    sousAgence: SousAgence

    @Column()
    isAdmin: boolean = false

}

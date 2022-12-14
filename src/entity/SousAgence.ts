import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Agence } from "./Agence";
import { Ville } from "./Ville"

@Entity()
export class SousAgence {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nom: string

    @Column()
    adresse: string

    @Column()
    telephone: string

    @Column()
    email: string

    @ManyToOne(() => Agence, (agence) => agence.sousAgences, { nullable: false })
    agence: Agence

    @ManyToOne(() => Ville, (ville) => ville.sousAgences, { nullable: false })
    ville: Ville
}

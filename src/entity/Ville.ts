import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { SousAgence } from "./SousAgence";
import { Pays } from "./Pays";

@Entity()
export class Ville {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    code: string

    @Column()
    nom: string

    @ManyToOne(() => Pays, (pays) => pays.villes, { nullable: false })
    pays: Pays

    @OneToMany(() => SousAgence, (sousAgence) => sousAgence.ville)
    sousAgences: SousAgence[]
}

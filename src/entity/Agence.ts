import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { SousAgence } from "./SousAgence";

export enum StatutAgence {
    ACTIF = "actif",
    INACTIF = "inactif"
}

@Entity()
export class Agence {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nom: string

    @Column("enum", { enum: StatutAgence, default: StatutAgence.ACTIF })
    statut: string

    @Column()
    balance: number

    @OneToMany(() => SousAgence, (sousAgence) => sousAgence.agence)
    sousAgences: SousAgence[]
}

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

    @Column({ unique: true })
    nom: string

    @Column({ type: "enum", enum: StatutAgence, default: StatutAgence.ACTIF })
    statut: string

    @Column({ type: "decimal", precision: 17, scale: 6, default: 0 })
    balance: number

    @OneToMany(() => SousAgence, (sousAgence) => sousAgence.agence)
    sousAgences: SousAgence[]

}

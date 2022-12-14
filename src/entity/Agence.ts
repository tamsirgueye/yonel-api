import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { SousAgence } from "./SousAgence";

// DataTypeNotSupportedError: Data type "enum" in "Agence.statut" is not supported by "sqlite" database.
/*export enum statutAgence {
    ACTIF = "actif",
    INACTIF = "inactif"
}*/

@Entity()
export class Agence {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nom: string

    //@Column("enum", { enum: statutAgence, default: statutAgence.ACTIF })
    @Column()
    statut: string = 'actif'

    @Column()
    balance: number

    @OneToMany(() => SousAgence, (sousAgence) => sousAgence.agence)
    sousAgences: SousAgence[]
}

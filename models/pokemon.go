package models

import "gorm.io/gorm"

// Pokemon represents a Pokémon in the application.
// It contains various properties such as ID, Name, PrimaryType, SecondaryType, Evolutions, and MoveSet.
// The ID field is the unique identifier of the Pokémon.
// The Name field represents the name of the Pokémon.
// The PrimaryType field is the primary type of the Pokémon.
// The PrimaryTypeId field is the foreign key to the primary type of the Pokémon.
// The SecondaryType field is the secondary type of the Pokémon.
// The SecondaryTypeId field is the foreign key to the secondary type of the Pokémon.
// The Evolutions field is a list of evolutions for the Pokémon.
// The PreviousEvolution field represents the previous evolution of the Pokémon.
// The MoveSet field is a list of moves that the Pokémon can learn.
type Pokemon struct {
	ID uint `gorm:"primary_key" json:"id"`
	gorm.Model
	Name              string      `json:"name"`
	PrimaryType       Type        `gorm:"foreignKey:PrimaryTypeId" json:"primary_type"`
	PrimaryTypeId     uint        `json:"primary_type_id_id"`
	SecondaryType     Type        `gorm:"foreignKey:SecondaryTypeId" json:"secondary_type"`
	SecondaryTypeId   uint        `json:"secondary_type_id"`
	Evolutions        []Evolution `json:"evolutions"`
	PreviousEvolution Evolution   `gorm:"foreignKey:TargetPokemonId" json:"previous_evolution"`
	MoveSet           []Move      `gorm:"many2many:pokemon_move_set" json:"move_set"`
}

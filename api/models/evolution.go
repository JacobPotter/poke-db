package models

// Evolution represents the evolution of a Pokémon. It contains information such as the ID,
// the PokemonId of the Pokémon being evolved, the TargetPokemonId of the target Pokémon, the level requirement for the evolution,
// and the ID of the evolution requirement. The EvolutionRequirement field represents the evolution requirement
// for this evolution.
type Evolution struct {
	ID                     uint                 `gorm:"primaryKey;auto_increment" json:"id"`
	PokemonId              uint                 `json:"pokemon_id"`
	TargetPokemonId        uint                 `json:"target_pokemon_id"`
	LevelRequirement       uint                 `json:"level_requirement"`
	EvolutionRequirement   EvolutionRequirement `json:"evolution_requirement"`
	EvolutionRequirementId uint                 `json:"evolution_requirement_id"`
}

// EvolutionRequirement represents a requirement for the evolution of a Pokémon.
// It contains properties such as ID, Name.
// The ID field is the unique identifier of the evolution requirement.
// The Name field represents the name of the evolution requirement.
//
// Example usage:
//
//	evolutionReq := EvolutionRequirement{
//		Name: "Level",
//	}
type EvolutionRequirement struct {
	ID   uint   `gorm:"primaryKey;auto_increment" json:"id"`
	Name string `gorm:"unique" json:"name"`
}

type Evolutions struct {
	Evolutions []Evolution `json:"evolutions"`
}

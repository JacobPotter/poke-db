package models

import "gorm.io/gorm"

type EvolutionChain struct {
	ID                 uint               `gorm:"primary_key" json:"id,omitempty"`
	BabyTriggerItem    *Item              `gorm:"default:null;foreignkey:BabyTriggerItemId" json:"babyTriggerItem"`
	BabyTriggerItemId  *uint              `json:"babyTriggerItemId,omitempty"`
	ChainLink          EvolutionChainLink `json:"chainLink,omitempty"`
	ChainLinkId        *uint              `json:"chainLinkId,omitempty"`
	InitPokemonSpecies PokemonSpecies     `gorm:"foreignKey:PokemonSpeciesId" json:"pokemonSpecies"`
	PokemonSpeciesId   uint               `json:"pokemonSpeciesId"`
}

type EvolutionChainLink struct {
	ID               uint                 `gorm:"primary_key" json:"id,omitempty"`
	IsBaby           bool                 `json:"isBaby,omitempty"`
	PokemonSpecies   PokemonSpecies       `json:"pokemonSpecies"`
	PokemonSpeciesId uint                 `gorm:"uniqueIndex" json:"pokemonSpeciesId"`
	EvolutionDetails []EvolutionDetails   `gorm:"foreignKey:EvolutionChainLinkID" json:"evolutionDetails,omitempty"`
	EvolvesTo        []EvolutionChainLink `gorm:"foreignKey:EvolvesFromId" json:"evolvesTo,omitempty"`
	EvolvesFromId    *uint                `json:"evolvesFromId,omitempty"`
}

type EvolutionDetails struct {
	gorm.Model
	Item                  *Item            `gorm:"default:null;foreignkey:ItemID" json:"item,omitempty"`
	ItemID                *uint            `json:"itemId,omitempty"`
	EvolutionTrigger      EvolutionTrigger `gorm:"foreignkey:EvolutionTriggerId" json:"trigger,omitempty"`
	EvolutionTriggerId    *uint            `json:"triggerId,omitempty"`
	GenderId              *int             `json:"genderId,omitempty"`
	HeldItem              *Item            `gorm:"default:null;foreignkey:HeldItemId" json:"heldItem,omitempty"`
	HeldItemId            *uint            `json:"heldItemId,omitempty"`
	KnownMove             *Move            `gorm:"default:null;foreignkey:KnownMoveID" json:"knownMove,omitempty"`
	KnownMoveID           *uint            `json:"knownMoveId,omitempty"`
	KnownMoveType         *MoveType        `gorm:"default:null;foreignkey:KnownMoveTypeID" json:"knownMoveType,omitempty"`
	KnownMoveTypeID       *uint            `json:"knownMoveTypeId,omitempty"`
	Location              *Location        `gorm:"default:null;foreignkey:LocationID" json:"location,omitempty"`
	LocationID            *uint            `json:"locationId,omitempty"`
	MinLevel              *int             `json:"minLevel,omitempty"`
	MinHappiness          *int             `json:"minHappiness,omitempty"`
	MinBeauty             *int             `json:"minBeauty,omitempty"`
	MinAffection          *int             `json:"minAffection,omitempty"`
	NeedsOverworldRain    *bool            `json:"needsOverworldRain,omitempty"`
	PartySpecies          *PokemonSpecies  `gorm:"default:null;foreignkey:PartySpeciesID" json:"partySpecies,omitempty"`
	PartySpeciesID        *uint            `json:"partySpeciesId,omitempty"`
	PartyType             *MoveType        `gorm:"default:null;foreignkey:PartyTypeId" json:"partyType,omitempty"`
	PartyTypeId           *uint            `json:"partyTypeId,omitempty"`
	RelativePhysicalStats *int             `json:"relativePhysicalStats,omitempty"`
	TimeOfDay             *string          `json:"timeOfDay,omitempty"`
	TradeSpecies          *PokemonSpecies  `gorm:"default:null;foreignkey:TradeSpeciesID" json:"tradeSpecies,omitempty"`
	TradeSpeciesID        *uint            `json:"tradeSpeciesId,omitempty"`
	TurnUpsideDown        *bool            `json:"turnUpsideDown,omitempty"`
	EvolutionChainLinkID  uint             `json:"chainLinkId,omitempty"`
}

type EvolutionTrigger struct {
	ID   uint   `gorm:"primary_key" json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}

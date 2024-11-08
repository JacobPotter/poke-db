package models

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type EvolutionChain struct {
	ID                uint               `gorm:"primary_key" json:"id,omitempty"`
	BabyTriggerItem   *Item              `gorm:"default:null;foreignkey:BabyTriggerItemId" json:"babyTriggerItem"`
	BabyTriggerItemId *uint              `json:"babyTriggerItemId,omitempty"`
	ChainLink         EvolutionChainLink `json:"chainLink,omitempty"`
	ChainLinkId       *uint              `json:"chainLinkId,omitempty"`
}

type EvolutionChainLink struct {
	ID               uint                 `gorm:"primary_key" json:"id,omitempty"`
	IsBaby           bool                 `json:"isBaby,omitempty"`
	PokemonSpecies   PokemonSpecies       `json:"pokemonSpecies,omitempty"`
	PokemonSpeciesId uint                 `gorm:"uniqueIndex" json:"pokemonSpeciesId"`
	EvolutionDetails []EvolutionDetails   `gorm:"foreignKey:EvolutionChainLinkID" json:"evolutionDetails,omitempty"`
	EvolvesTo        []EvolutionChainLink `gorm:"foreignKey:EvolvesFromId" json:"evolvesTo,omitempty"`
	EvolvesFrom      *EvolutionChainLink  `json:"evolvesFrom,omitempty"`
	EvolvesFromId    *uint                `json:"evolvesFromId,omitempty"`
}

type EvolutionDetails struct {
	ID                    uint             `gorm:"primary_key" json:"id,omitempty"`
	Item                  *Item            `gorm:"default:null;foreignkey:ItemID" json:"item,omitempty"`
	ItemID                *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"itemId,omitempty"`
	EvolutionTrigger      EvolutionTrigger `gorm:"foreignkey:EvolutionTriggerId" json:"trigger,omitempty"`
	EvolutionTriggerId    *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"triggerId,omitempty"`
	GenderId              *int             `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"genderId,omitempty"`
	HeldItem              *Item            `gorm:"default:null;foreignkey:HeldItemId" json:"heldItem,omitempty"`
	HeldItemId            *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"heldItemId,omitempty"`
	KnownMove             *Move            `gorm:"default:null;foreignkey:KnownMoveID" json:"knownMove,omitempty"`
	KnownMoveID           *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"knownMoveId,omitempty"`
	KnownMoveType         *MoveType        `gorm:"default:null;foreignkey:KnownMoveTypeID" json:"knownMoveType,omitempty"`
	KnownMoveTypeID       *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"knownMoveTypeId,omitempty"`
	Location              *Location        `gorm:"default:null;foreignkey:LocationID" json:"location,omitempty"`
	LocationID            *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"locationId,omitempty"`
	MinLevel              *int             `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"minLevel,omitempty"`
	MinHappiness          *int             `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"minHappiness,omitempty"`
	MinBeauty             *int             `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"minBeauty,omitempty"`
	MinAffection          *int             `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"minAffection,omitempty"`
	NeedsOverworldRain    *bool            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"needsOverworldRain,omitempty"`
	PartySpecies          *PokemonSpecies  `gorm:"default:null;foreignkey:PartySpeciesID" json:"partySpecies,omitempty"`
	PartySpeciesID        *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"partySpeciesId,omitempty"`
	PartyType             *MoveType        `gorm:"default:null;foreignkey:PartyTypeId" json:"partyType,omitempty"`
	PartyTypeId           *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"partyTypeId,omitempty"`
	RelativePhysicalStats *int             `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"relativePhysicalStats,omitempty"`
	TimeOfDay             *string          `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"timeOfDay,omitempty"`
	TradeSpecies          *PokemonSpecies  `gorm:"default:null;foreignkey:TradeSpeciesID" json:"tradeSpecies,omitempty"`
	TradeSpeciesID        *uint            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"tradeSpeciesId,omitempty"`
	TurnUpsideDown        *bool            `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"turnUpsideDown,omitempty"`
	EvolutionChainLinkID  uint             `gorm:"uniqueIndex:details_index,option:NULLS NOT DISTINCT" json:"chainLinkId,omitempty"`
}

func (e EvolutionDetails) BeforeCreate(tx *gorm.DB) (err error) {
	var cols []clause.Column
	var colsNames []string
	for _, field := range tx.Statement.Schema.Fields {
		dbName := field.DBName

		if dbName != "" && dbName != "id" {
			cols = append(cols, clause.Column{Name: dbName})
			colsNames = append(colsNames, dbName)
		}
	}
	tx.Statement.AddClause(clause.OnConflict{
		Columns: cols,
		// DoUpdates: clause.AssignmentColumns(colsNames),
		DoNothing: true,
	})
	return nil
}

type EvolutionTrigger struct {
	ID   uint   `gorm:"primary_key" json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}

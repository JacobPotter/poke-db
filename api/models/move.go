package models

// Move represents a move in the application. It contains properties such as ID, Type, TypeID, and Damage.
// The ID field is the unique identifier of the move.
// The Type field represents the type of the move.
// The TypeID field is the foreign key to the type of the move.
// The Damage field represents the damage inflicted by the move.
type Move struct {
	ID     uint   `gorm:"primary_key;auto_increment" json:"id"`
	Name   string `json:"name"`
	Type   Type   `json:"type"`
	TypeID uint   `json:"type_id"`
	Damage uint   `json:"damage"`
}

type Moves struct {
	Moves []Move `json:"moves"`
}

package models

// Type represents a type in the application. It contains properties such as ID, Name, SuperEffective,
// NotVeryEffective, and NoEffect. The ID field is the unique identifier of the type. The Name field represents
// the name of the type. The SuperEffective field contains a list of type IDs that are super effective against
// this type. The NotVeryEffective field contains a list of type IDs that are not very effective against this type.
// The NoEffect field contains a list of type IDs that have no effect on this type.
type Type struct {
	ID               uint   `gorm:"primary_key" json:"id"`
	Name             string `gorm:"not null" json:"name"`
	SuperEffective   []uint `gorm:"serializer:json" json:"super_effective,omitempty"`
	NotVeryEffective []uint `gorm:"serializer:json" json:"not_very_effective,omitempty"`
	NoEffect         []uint `gorm:"serializer:json" json:"no_effect,omitempty"`
}

type Types struct {
	Types []Type `json:"types"`
}

package models

type Item struct {
	GenericId `gorm:"primary_key;column:id" json:"id"`
	Name      string `json:"name"`
	SpriteUrl string `json:"spriteUrl"`
}

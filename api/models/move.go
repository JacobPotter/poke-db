package models

type Move struct {
	Id               int       `json:"id"`
	Name             string    `json:"name"`
	Accuracy         int       `json:"accuracy"`
	Pp               int       `json:"pp"`
	Priority         int       `json:"priority"`
	Power            int       `json:"power"`
	MoveType         MoveType  `json:"moveType"`
	MoveTypeID       uint      `json:"moveTypeID"`
	LearnedByPokemon []Pokemon `gorm:"many2many:pokemon_move_sets;" json:"learnedByPokemon"`
}

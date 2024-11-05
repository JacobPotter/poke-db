package jobs

import (
	"gorm.io/gorm"
)

type RefreshDB struct {
	DB   *gorm.DB
	Test bool
}

type DamageLink struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

func (r RefreshDB) Run() {
	r.refreshTypes()
	r.refreshItems()
	r.refreshLocations()
	r.refreshPokemon()
	r.refreshMoves()
	r.refreshEvolutionTriggers()
	r.refreshEvolutionsChains()
}

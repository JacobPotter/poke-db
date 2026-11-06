// Package refresh ingests data from the PokeAPI into the database.
// It is run as a standalone binary (cmd/refresh-db), scheduled by a Kubernetes CronJob.
package refresh

import (
	"errors"

	"gorm.io/gorm"
)

type RefreshDB struct {
	DB *gorm.DB
	// Test limits the number of records fetched from the PokeAPI.
	Test bool
}

type DamageLink struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

// Run executes every refresh step in dependency order.
// Types are a hard dependency for later steps, so a failure there aborts the run.
func (r RefreshDB) Run() error {
	if r.DB == nil {
		return errors.New("refresh: DB is nil")
	}
	if err := r.refreshTypes(); err != nil {
		return err
	}
	r.refreshItems()
	r.refreshLocations()
	r.refreshPokemon()
	r.refreshMoves()
	r.refreshEvolutionTriggers()
	r.refreshEvolutionsChains()
	return nil
}

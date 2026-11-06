package refresh

import (
	"os"
	"testing"

	"github.com/JacobPotter/poke-db/api/models"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

// RefreshDbTestSuite runs the refresh against a real PostgreSQL 15+ database
// and the live PokeAPI. Set FULL_SEED_TEST=true to run a full (slow) seed.
type RefreshDbTestSuite struct {
	suite.Suite
	db *gorm.DB
}

func (s *RefreshDbTestSuite) SetupSuite() {
	models.ConnectDatabase()
	s.Require().NotNil(models.DB, "database connection is nil")
	s.Require().NoError(models.MigrateAll(models.DB),
		"migration failed (PostgreSQL 15+ is required for NULLS NOT DISTINCT indexes)")
	s.db = models.DB
}

func TestRefreshDBSuite(t *testing.T) {
	suite.Run(t, new(RefreshDbTestSuite))
}

func (s *RefreshDbTestSuite) TestRefreshDb() {
	test := os.Getenv("FULL_SEED_TEST") != "true"

	s.Require().NoError(RefreshDB{DB: s.db, Test: test}.Run())

	var items []models.Item
	s.Require().NoError(s.db.Find(&items).Error, "finding items")
	s.NotEmpty(items)

	var regions []models.Region
	s.Require().NoError(s.db.Preload("Locations").Find(&regions).Error, "finding regions")
	s.Require().NotEmpty(regions)
	s.NotEmpty(regions[0].Locations)

	var species []models.PokemonSpecies
	s.Require().NoError(s.db.Preload("Varieties").Find(&species).Error, "finding species")
	s.NotEmpty(species)

	var moves []models.Move
	s.Require().NoError(s.db.Preload("LearnedByPokemon").Preload("MoveType").Find(&moves).Error, "finding moves")
	s.NotEmpty(moves)

	var triggers []models.EvolutionTrigger
	s.Require().NoError(s.db.Find(&triggers).Error, "finding evolution triggers")
	s.NotEmpty(triggers)
}

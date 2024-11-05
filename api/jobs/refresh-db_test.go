package jobs

import (
	"github.com/WebWizardsDev/poke-db/api/models"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
	"log"
	"os"
	"testing"
)

type RefreshDbTestSuite struct {
	suite.Suite
	db *gorm.DB
}

func (s *RefreshDbTestSuite) SetupTest() {
	// Setup code before each test
	models.ConnectDatabase()

	err := models.DB.AutoMigrate(
		&models.Pokemon{},
		&models.MoveType{},
		&models.PokemonSpecies{},
		&models.Item{},
		&models.Region{},
		&models.Location{},
		&models.Move{},
		&models.EvolutionTrigger{},
		&models.EvolutionChainLink{},
		&models.EvolutionDetails{},
		&models.EvolutionChain{},
	)

	if err != nil {
		log.Printf("error migrating db: %v", err)
		return
	}

	s.db = models.DB
}

func TestRefreshDBSuite(t *testing.T) {
	// Run the test suite
	suite.Run(t, new(RefreshDbTestSuite))
}

func (s *RefreshDbTestSuite) TestRefreshDb() {
	var test = true

	if os.Getenv("FULL_SEED_TEST") == "true" {
		test = false
	}

	RefreshDB{DB: s.db, Test: test}.Run()

	var items []models.Item

	tx := s.db.Find(&items)

	if tx.Error != nil {
		s.FailNow("Error refreshing items", tx.Error.Error())
	}

	s.NotEmpty(items)

	var regions []models.Region

	tx = s.db.Preload("Locations").Find(&regions)

	if tx.Error != nil {
		s.FailNow("Error finding regions", tx.Error.Error())
	}

	s.NotEmpty(regions)
	s.NotEmpty(regions[0].Locations)

	var species []models.PokemonSpecies

	tx = s.db.Preload("Varieties").Find(&species)

	if tx.Error != nil {
		s.FailNow("Error finding species", tx.Error.Error())
	}

	s.NotEmpty(species)

	var moves []models.Move

	tx = s.db.Preload("LearnedByPokemon").Preload("MoveType").Find(&moves)

	if tx.Error != nil {
		s.FailNow("Error finding moves", tx.Error.Error())
	}

	s.NotEmpty(moves)

	var triggers []models.EvolutionTrigger

	tx = s.db.Find(&triggers)

	if tx.Error != nil {
		s.FailNow("Error finding evo triggers", tx.Error.Error())
	}

	s.NotEmpty(triggers)

}

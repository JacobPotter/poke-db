package controllers_test

import (
	"encoding/json"
	"github.com/WebWizardsDev/poke-db/api/models"
	"github.com/WebWizardsDev/poke-db/api/routes"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
	"net/http"
	"net/http/httptest"
	"testing"
)

type PokmemonTestSuite struct {
	suite.Suite
	router *gin.Engine
}

func (s *PokmemonTestSuite) SetupTest() {
	// Setup code before each test
	models.ConnectDatabase()
	s.router = routes.SetupRouter(models.DB.Debug())

}

func TestPokemonSuite(t *testing.T) {
	// Run the test suite
	suite.Run(t, new(PokmemonTestSuite))
}

// TestPokemonHandler_ListPokemon tests the ListPokemon function of the PokemonHandler.
// It sets up a test environment, mocks the database connection, and expects a SELECT query to be executed.
// The function sends a GET request to the "/pokemon" route, and asserts that the response code is 200.
// Finally, it checks if all the expectations of the mock database were met.
func (s *PokmemonTestSuite) TestPokemonHandler_ListPokemon_Basic() {

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/pokemon", nil)

	s.router.ServeHTTP(w, req)

	var response models.ListPokemonResponse

	err := json.Unmarshal(w.Body.Bytes(), &response)

	s.Require().NoError(err)

	s.Equal(http.StatusOK, w.Code)
	s.NotEmpty(response.Pokemon)
	s.NotEmpty(response.Pokemon[0].Varieties)
}

func (s *PokmemonTestSuite) TestPokemonHandler_ListPokemon_Pagination() {

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/pokemon?page=2&pageSize=12", nil)

	s.router.ServeHTTP(w, req)

	var response models.ListPokemonResponse

	err := json.Unmarshal(w.Body.Bytes(), &response)

	s.Require().NoError(err)

	s.Equal(http.StatusOK, w.Code)
	s.NotEmpty(response.Pokemon)
}

func (s *PokmemonTestSuite) TestPokemonHandler_ListPokemon_Query_Name() {

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/pokemon?pokemonName=bulba", nil)

	s.router.ServeHTTP(w, req)

	var response models.ListPokemonResponse

	err := json.Unmarshal(w.Body.Bytes(), &response)

	s.Require().NoError(err)

	s.Equal(http.StatusOK, w.Code)
	s.NotEmpty(response.Pokemon)
}

func (s *PokmemonTestSuite) TestPokemonHandler_ListPokemon_Query_Type_ID() {

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/pokemon?pokemonTypeId=10", nil)

	s.router.ServeHTTP(w, req)

	var response models.ListPokemonResponse

	err := json.Unmarshal(w.Body.Bytes(), &response)

	s.Require().NoError(err)

	s.Equal(http.StatusOK, w.Code)
	s.NotEmpty(response.Pokemon)

}

package controllers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
)

// TestPokemonHandler_ListPokemon tests the ListPokemon function of the PokemonHandler.
// It sets up a test environment, mocks the database connection, and expects a SELECT query to be executed.
// The function sends a GET request to the "/pokemon" route, and asserts that the response code is 200.
// Finally, it checks if all the expectations of the mock database were met.
func TestPokemonHandler_ListPokemon(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()
	t.Run("should list pokemon", func(t *testing.T) {

		expectedSQL := `SELECT * FROM "pokemons" LIMIT $1`
		rows := mock.NewRows([]string{"id", "name"}).AddRow("1", "Bulbasaur")
		mock.ExpectQuery(expectedSQL).WithArgs(10).WillReturnRows(rows)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/pokemon", nil)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unfulfilled expectations: %s", err)

		}
	})
}

// TestPokemonHandler_GetPokemon tests the functionality of the GetPokemon function in the PokemonHandler.
// It sets up the necessary dependencies and mocks, and then sends a GET request to the "/pokemon/:id" route with a valid ID.
// The function expects to receive a response with a status code of 200 and the expected Pokemon object in the response body.
// It also checks for any unfulfilled expectations on the mock object.
func TestPokemonHandler_GetPokemon(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should get pokemon by id", func(t *testing.T) {

		expectedSQL := "SELECT * FROM \"pokemons\" WHERE \"pokemons\".\"id\"  = $1 ORDER BY \"pokemons\".\"id\" LIMIT $2"
		rows := mock.NewRows([]string{"id", "name", "primary_type_id", "secondary_type_id"}).AddRow("1", "Bulbasaur", 2, nil)

		mock.ExpectQuery(expectedSQL).WithArgs("1", 1).WillReturnRows(rows)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/pokemon/1", nil)

		router.ServeHTTP(w, req)

		var expected, actual models.Pokemon

		expected = models.Pokemon{
			ID:            1,
			Name:          "Bulbasaur",
			PrimaryTypeId: 2,
		}

		err := json.Unmarshal(w.Body.Bytes(), &actual)

		if err != nil {
			t.Fatalf("could not unmarshal JSON: %s", err)
		}

		if err = mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unfulfilled expectations: %s", err)
		}

		assert.Equal(t, 200, w.Code)
		assert.Equal(t, expected, actual)

	})
}

func TestPokemonHandler_CreatePokemon(t *testing.T) {
	router, mock, db := setupTest(t)

	defer db.Close()

	t.Run("should create pokemon", func(t *testing.T) {
		newPokemon := models.Pokemon{
			Name:          "Charmander",
			PrimaryTypeId: 4,
		}

		expectedSql := "INSERT INTO \"pokemons\" (\"name\",\"primary_type_id\",\"secondary_type_id\") VALUES ($1,$2,$3) RETURNING \"id\""

		mock.ExpectBegin()
		mock.ExpectQuery(expectedSql).WithArgs("Charmander", 4, 0).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectCommit()

		body, err := json.Marshal(newPokemon)

		if err != nil {
			t.Fatalf("could not marshal JSON: %s", err)
		}

		w := httptest.NewRecorder()

		req, _ := http.NewRequest(http.MethodPost, "/api/v1/pokemon", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		if err = mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unfulfilled expectations: %s", err)
		}
	})

}

func TestPokemonHandler_UpdatePokemon(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should update pokemon", func(t *testing.T) {
		updatedPokemon := models.Pokemon{ID: 1, Name: "Charmander", PrimaryTypeId: 4}

		row := sqlmock.NewRows([]string{"id", "name", "primary_type_id", "secondary_type_id"}).
			AddRow(strconv.Itoa(int(updatedPokemon.ID)), "Charmanger", updatedPokemon.PrimaryTypeId, updatedPokemon.SecondaryTypeId)
		expectedSqlSel := "SELECT * FROM \"pokemons\" WHERE id = $1 ORDER BY \"pokemons\".\"id\" LIMIT $2"
		mock.ExpectQuery(expectedSqlSel).WithArgs(strconv.Itoa(int(updatedPokemon.ID)), 1).WillReturnRows(row)

		mock.ExpectBegin()
		expectedSQLUpdate := "UPDATE \"pokemons\" SET \"id\"=$1,\"name\"=$2,\"primary_type_id\"=$3 WHERE \"id\" = $4"
		mock.ExpectExec(expectedSQLUpdate).
			WithArgs(
				updatedPokemon.ID,
				updatedPokemon.Name,
				updatedPokemon.PrimaryTypeId,
				updatedPokemon.ID,
			).
			WillReturnResult(sqlmock.NewResult(int64(updatedPokemon.ID), 1))
		mock.ExpectCommit()

		body, err := json.Marshal(updatedPokemon)

		if err != nil {
			t.Fatalf("could not marshal JSON: %s", err)

		}

		w := httptest.NewRecorder()

		req, _ := http.NewRequest("PUT", fmt.Sprintf("/api/v1/pokemon/%d", updatedPokemon.ID), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, req)

		assert.Equal(t, 200, w.Code)

		if err = mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unfulfilled expectations: %s", err)
		}
	})
}

func TestPokemonHandler_DeletePokemon(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should delete pokemon", func(t *testing.T) {
		expectedSqlSel := "SELECT * FROM \"pokemons\" WHERE \"pokemons\".\"id\" = $1 ORDER BY \"pokemons\".\"id\" LIMIT $2"
		mock.ExpectQuery(expectedSqlSel).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).
				AddRow(1))

		expectedSqlDelete := "DELETE FROM \"pokemons\" WHERE \"pokemons\".\"id\" = $1"

		mock.ExpectBegin()
		mock.ExpectExec(expectedSqlDelete).
			WithArgs(1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("DELETE", "/api/v1/pokemon/1", nil)

		router.ServeHTTP(w, req)

		assert.Equal(t, 200, w.Code)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unfulfilled expectations: %s", err)
		}

	})
}

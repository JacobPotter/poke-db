package controllers_test

import (
	"bytes"
	"encoding/json"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestEvolutionHandler_ListEvolution(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should list evolutions", func(t *testing.T) {
		expectedSql := `SELECT * FROM "evolutions" LIMIT $1`

		rows := mock.NewRows([]string{"id", "pokemon_id", "target_pokemon_id"}).
			AddRow(1, 1, 2)
		mock.ExpectQuery(expectedSql).WithArgs(10).WillReturnRows(rows)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/evolution", nil)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %v", err)
		}
	})

}

func TestEvolutionHandler_GetEvolution(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should get evolution", func(t *testing.T) {
		expectedSql := `SELECT * FROM "evolutions" WHERE "evolutions"."id" = $1 ORDER BY "evolutions"."id" LIMIT $2`

		rows := mock.NewRows([]string{"id", "pokemon_id", "target_pokemon_id"}).
			AddRow(1, 1, 2)
		mock.ExpectQuery(expectedSql).WithArgs("1", 1).WillReturnRows(rows)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/evolution/1", nil)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %v", err)
		}
	})
}

func TestEvolutionHandler_CreateEvolution(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should create evolution", func(t *testing.T) {
		expectedSql := `INSERT INTO "evolutions" ("pokemon_id","target_pokemon_id") VALUES ($1,$2)`

		rows := mock.NewRows([]string{"id", "pokemon_id", "target_pokemon_id"}).AddRow(1, 1, 2)

		mock.ExpectBegin()
		mock.ExpectQuery(expectedSql).WithArgs(1, 2).WillReturnRows(rows)
		mock.ExpectCommit()

		newEvolution := models.Evolution{
			PokemonId:       1,
			TargetPokemonId: 2,
		}

		body, err := json.Marshal(newEvolution)

		if err != nil {
			t.Fatalf("error while marshalling evolution")
		}

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodPost, "/api/v1/evolution", bytes.NewBuffer(body))

		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)
	})
}

func TestEvolutionHandler_UpdateEvolution(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should update evolution", func(t *testing.T) {
		expectedSelectSql := `SELECT * FROM "evolutions" WHERE "evolutions"."id" = $1 ORDER BY "evolutions"."id" LIMIT $2`

		rows := sqlmock.NewRows([]string{"id", "pokemon_id", "target_pokemon_id"}).
			AddRow(2, 2, 4)

		mock.ExpectQuery(expectedSelectSql).WithArgs("2", 1).WillReturnRows(rows)

		updatedEvolution := models.Evolution{
			ID:              2,
			PokemonId:       2,
			TargetPokemonId: 3,
		}

		expectedUpdateSql := `UPDATE "evolutions" SET "id"=$1,"pokemon_id"=$2,"target_pokemon_id"=$3 WHERE "id" = $4`

		mock.ExpectBegin()
		mock.ExpectExec(expectedUpdateSql).
			WithArgs(
				updatedEvolution.ID,
				updatedEvolution.PokemonId,
				updatedEvolution.TargetPokemonId,
				updatedEvolution.ID,
			).WillReturnResult(sqlmock.NewResult(2, 1))
		mock.ExpectCommit()

		body, err := json.Marshal(updatedEvolution)
		if err != nil {
			t.Fatalf("error while marshalling evolution: %s", err)
		}

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodPut, "/api/v1/evolution/2", bytes.NewBuffer(body))

		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestEvolutionHandler_DeleteEvolution(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should delete evolution", func(t *testing.T) {
		expectedSelectSql := `SELECT * FROM "evolutions" WHERE "evolutions"."id" = $1 ORDER BY "evolutions"."id" LIMIT $2`

		mock.ExpectQuery(expectedSelectSql).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "pokemon_id", "target_pokemon_id"}).
				AddRow(1, 1, 2))

		expectedDeleteSql := `DELETE FROM "evolutions" WHERE "evolutions"."id" = $1`

		mock.ExpectBegin()
		mock.ExpectExec(expectedDeleteSql).WithArgs(1).WillReturnResult(sqlmock.NewResult(2, 1))
		mock.ExpectCommit()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodDelete, "/api/v1/evolution/1", nil)

		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)

	})

}

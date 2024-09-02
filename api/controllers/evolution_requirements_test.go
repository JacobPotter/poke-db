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

func TestEvolutionRequirementHandler_ListEvolutionRequirement(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should list evolution_requirements", func(t *testing.T) {
		expectedSql := `SELECT * FROM "evolution_requirements" LIMIT $1`

		rows := mock.NewRows([]string{"id", "name"}).
			AddRow(1, "Sun Stone")
		mock.ExpectQuery(expectedSql).WithArgs(10).WillReturnRows(rows)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/evolution_requirements", nil)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %v", err)
		}
	})

}

func TestEvolutionRequirementHandler_GetEvolutionRequirement(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should get evolution requirements", func(t *testing.T) {
		expectedSql := `SELECT * FROM "evolution_requirements" WHERE id = $1 ORDER BY "evolution_requirements"."id" LIMIT $2`

		rows := mock.NewRows([]string{"id", "name"}).
			AddRow(1, "Sun Stone")
		mock.ExpectQuery(expectedSql).WithArgs("1", 1).WillReturnRows(rows)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/evolution_requirements/1", nil)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %v", err)
		}
	})
}

func TestEvolutionRequirementHandler_CreateEvolutionRequirement(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should create evolution requirement", func(t *testing.T) {
		expectedSql := `INSERT INTO "evolution_requirements" ("name") VALUES ($1) RETURNING "id"`

		rows := mock.NewRows([]string{"id", "name"}).AddRow(1, "Sun Stone")

		mock.ExpectBegin()
		mock.ExpectQuery(expectedSql).WithArgs("Sun Stone").WillReturnRows(rows)
		mock.ExpectCommit()

		newEvolutionRequirement := models.EvolutionRequirement{
			Name: "Sun Stone",
		}

		body, err := json.Marshal(newEvolutionRequirement)

		if err != nil {
			t.Fatalf("error while marshalling evolution")
		}

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodPost, "/api/v1/evolution_requirements", bytes.NewBuffer(body))

		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)
	})
}

func TestEvolutionRequirementHandler_UpdateEvolutionRequirement(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should update evolution requirement", func(t *testing.T) {
		expectedSelectSql := `SELECT * FROM "evolution_requirements" WHERE id = $1 ORDER BY "evolution_requirements"."id" LIMIT $2`

		rows := sqlmock.NewRows([]string{"id", "name"}).
			AddRow(2, "Moon Stone")

		mock.ExpectQuery(expectedSelectSql).WithArgs("2", 1).WillReturnRows(rows)

		updatedEvolutionRequirement := models.EvolutionRequirement{
			ID:   2,
			Name: "Sun Stone",
		}

		expectedUpdateSql := `UPDATE "evolution_requirements" SET "id"=$1,"name"=$2 WHERE "id" = $3`

		mock.ExpectBegin()
		mock.ExpectExec(expectedUpdateSql).
			WithArgs(
				updatedEvolutionRequirement.ID,
				updatedEvolutionRequirement.Name,
				updatedEvolutionRequirement.ID,
			).WillReturnResult(sqlmock.NewResult(2, 1))
		mock.ExpectCommit()

		body, err := json.Marshal(updatedEvolutionRequirement)
		if err != nil {
			t.Fatalf("error while marshalling evolution: %s", err)
		}

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodPut, "/api/v1/evolution_requirements/2", bytes.NewBuffer(body))

		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestEvolutionRequirementHandler_DeleteEvolutionRequirement(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should delete evolution", func(t *testing.T) {
		expectedSelectSql := `SELECT * FROM "evolution_requirements" WHERE id = $1 ORDER BY "evolution_requirements"."id" LIMIT $2`

		mock.ExpectQuery(expectedSelectSql).
			WithArgs("1", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).
				AddRow(1, "Moon Stone"))

		expectedDeleteSql := `DELETE FROM "evolution_requirements" WHERE "evolution_requirements"."id" = $1`

		mock.ExpectBegin()
		mock.ExpectExec(expectedDeleteSql).WithArgs(1).WillReturnResult(sqlmock.NewResult(2, 1))
		mock.ExpectCommit()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodDelete, "/api/v1/evolution_requirements/1", nil)

		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)

	})

}

package controllers_test

import (
	"bytes"
	"encoding/json"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
)

func TestMoveHandler_ListMove(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should be able to list moves", func(t *testing.T) {
		expectedSql := `SELECT * FROM "moves" LIMIT $1`

		rows := sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Giga-Beam")
		mock.ExpectQuery(expectedSql).WithArgs(10).WillReturnRows(rows)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/moves", nil)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unfulfilled expectations: %s", err)
		}

	})

}

func TestMoveHandler_GetMove(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should be able to get a move", func(t *testing.T) {
		expectedSql := "SELECT * FROM \"moves\" WHERE \"moves\".\"id\" = $1 ORDER BY \"moves\".\"id\" LIMIT $2"

		rows := sqlmock.NewRows([]string{"id", "name", "type_id"}).AddRow(1, "Giga-Beam", 1)

		mock.ExpectQuery(expectedSql).WithArgs("1", 1).WillReturnRows(rows)

		w := httptest.NewRecorder()

		req, _ := http.NewRequest(http.MethodGet, "/api/v1/moves/1", nil)

		router.ServeHTTP(w, req)

		var expected, actual models.Move

		expected = models.Move{
			ID:     1,
			Name:   "Giga-Beam",
			TypeID: 1,
		}

		err := json.Unmarshal(w.Body.Bytes(), &actual)

		if err != nil {
			t.Fatalf("there was an error getting the move: %s", err)
		}

		if err = mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %s", err)
		}

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, expected, actual)

	})
}

func TestMoveHandler_CreateMove(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should be able to create a move", func(t *testing.T) {
		expectedSql := "INSERT INTO \"moves\" (\"name\",\"type_id\",\"damage\") VALUES ($1,$2,$3) RETURNING \"id\""

		move := models.Move{
			Name:   "Thunder Shock",
			TypeID: 5,
			Damage: 80,
		}

		rows := sqlmock.NewRows([]string{"id", "name", "type_id"}).AddRow(2, move.Name, move.TypeID)

		mock.ExpectBegin()
		mock.ExpectQuery(expectedSql).WithArgs(move.Name, move.TypeID, move.Damage).WillReturnRows(rows)
		mock.ExpectCommit()

		w := httptest.NewRecorder()

		moveJSON, _ := json.Marshal(move)
		req, _ := http.NewRequest(http.MethodPost, "/api/v1/moves", bytes.NewBuffer(moveJSON))
		req.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, req)

		var expected, actual models.Move

		expected = models.Move{
			ID:     2,
			Name:   "Thunder Shock",
			TypeID: 5,
			Damage: 80,
		}

		err := json.Unmarshal(w.Body.Bytes(), &actual)

		if err != nil {
			t.Fatalf("there was an error creating the move: %s", err)
		}

		if err = mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %s", err)
		}

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Equal(t, expected, actual)
	})

}
func TestMoveHandler_UpdateMove(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should be able to update a move", func(t *testing.T) {
		selectSql := `SELECT * FROM "moves" WHERE "moves"."id" = $1 ORDER BY "moves"."id" LIMIT $2`
		updateSql := `UPDATE "moves" SET "id"=$1,"name"=$2,"type_id"=$3,"damage"=$4 WHERE "id" = $5`

		moveUpdate := models.Move{
			ID:     1,
			Name:   "Thunderbolt",
			TypeID: 5,
			Damage: 90,
		}

		rows := sqlmock.NewRows([]string{"id", "name", "type_id", "damage"}).
			AddRow(moveUpdate.ID, "Giga-Beam", 1, 100)

		mock.ExpectQuery(selectSql).WithArgs(strconv.Itoa(int(moveUpdate.ID)), 1).WillReturnRows(rows)
		mock.ExpectBegin()
		mock.ExpectExec(updateSql).
			WithArgs(moveUpdate.ID, moveUpdate.Name, moveUpdate.TypeID, moveUpdate.Damage, moveUpdate.ID).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		w := httptest.NewRecorder()

		moveJSON, _ := json.Marshal(moveUpdate)
		req, _ := http.NewRequest(http.MethodPut, "/api/v1/moves/1", bytes.NewBuffer(moveJSON))
		req.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, req)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %s", err)
		}

		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestMoveHandler_DeleteMove(t *testing.T) {
	router, mock, db := setupTest(t)
	defer db.Close()

	t.Run("should be able to delete a move", func(t *testing.T) {
		selectSql := `SELECT * FROM "moves" WHERE "moves"."id" = $1 ORDER BY "moves"."id" LIMIT $2`

		deleteSql := `DELETE FROM "moves" WHERE "moves"."id" = $1`

		mock.ExpectQuery(selectSql).WithArgs("1", 1).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		mock.ExpectBegin()
		mock.ExpectExec(deleteSql).WithArgs(1).WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		w := httptest.NewRecorder()

		req, _ := http.NewRequest(http.MethodDelete, "/api/v1/moves/1", nil)
		router.ServeHTTP(w, req)

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("there were unfulfilled expectations: %s", err)
		}

		assert.Equal(t, http.StatusOK, w.Code)
	})
}

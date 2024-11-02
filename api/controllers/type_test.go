package controllers_test

//
//import (
//	"bytes"
//	"encoding/json"
//	"github.com/DATA-DOG/go-sqlmock"
//	"github.com/JacobPotter/poke-db/api/models"
//	"github.com/stretchr/testify/assert"
//	"net/http"
//	"net/http/httptest"
//	"testing"
//)
//
//// TestTypeHandler_ListType is a unit test function that tests the "ListType" functionality
//// of the TypeHandler. It sets up the necessary dependencies, such as the router, mock, and
//// database, and executes a test case where the expected SQL query is "SELECT * FROM \"moveTypes\"",
//// and the expected result is a HTTP response with status code 200 (OK). After the test execution,
//// it verifies if all expectations of the mock have been met.
//func TestTypeHandler_ListType(t *testing.T) {
//	router, mock, db := setupTest(t)
//	defer db.Close()
//	t.Run("should list moveTypes", func(t *testing.T) {
//		expectedSQL := `SELECT * FROM "moveTypes" LIMIT $1`
//		rows := sqlmock.NewRows([]string{"id", "name"}).AddRow("1", "Fire")
//		mock.ExpectQuery(expectedSQL).WithArgs(10).WillReturnRows(rows)
//
//		w := httptest.NewRecorder()
//		req, _ := http.NewRequest("GET", "/api/v1/type", nil)
//
//		router.ServeHTTP(w, req)
//
//		assert.Equal(t, 200, w.Code)
//		if err := mock.ExpectationsWereMet(); err != nil {
//			t.Errorf("there were unfulfilled expectations: %s", err)
//		}
//	})
//}
//
//// TestTypeHandler_GetType is a unit test function for testing the GetType function in the TypeHandler struct.
//// It sets up a test environment, mocks the database, and verifies that a single type can be retrieved by its ID.
//// The function uses the httptest package to send an HTTP GET request to the "/api/v1/type/1" endpoint and checks that the response code is 200 (OK).
//// It also checks that the expected SQL query is executed with the correct arguments and that all expectations are met.
//// This test function is part of the test suite for the TypeHandler struct.
//func TestTypeHandler_GetType(t *testing.T) {
//	router, mock, db := setupTest(t)
//	defer db.Close()
//	t.Run("should get single type by id", func(t *testing.T) {
//		rows := mock.NewRows([]string{"id", "name"}).AddRow("1", "Fire")
//
//		expectedSQL := "SELECT * FROM \"moveTypes\" WHERE id = $1 ORDER BY \"moveTypes\".\"id\" LIMIT $2"
//		mock.ExpectQuery(expectedSQL).
//			WithArgs("1", 1).
//			WillReturnRows(rows)
//
//		w := httptest.NewRecorder()
//		req, _ := http.NewRequest("GET", "/api/v1/type/1", nil)
//
//		router.ServeHTTP(w, req)
//		assert.Equal(t, 200, w.Code)
//
//		if err := mock.ExpectationsWereMet(); err != nil {
//			t.Errorf("there were unfulfilled expectations: %s", err)
//		}
//	})
//}
//
//// TestTypeHandler_CreateType is a test function for the CreateType handler in the TypeHandler struct.
//// It creates a new type by sending a POST request to the "/api/v1/type" endpoint with the type data in the request body.
//// It expects the response code to be 201 if the type is created successfully.
//// The function uses a mock database, sets up the necessary dependencies, and sends the request using the Gin router.
//// It also verifies that the expected SQL query is executed and commits the transaction.
//// If there are any unfulfilled expectations, an error message is logged.
//func TestTypeHandler_CreateType(t *testing.T) {
//	router, mock, db := setupTest(t)
//	defer db.Close()
//	t.Run("should create type", func(t *testing.T) {
//		newType := models.MoveType{Name: "Fire"}
//		expectedSQL := "INSERT INTO \"moveTypes\" (\"name\",\"super_effective\",\"not_very_effective\",\"no_effect\") VALUES ($1,$2,$3,$4) RETURNING \"id\""
//
//		mock.ExpectBegin()
//		mock.ExpectQuery(expectedSQL).WithArgs(
//			"Fire",
//			nil,
//			nil,
//			nil,
//		).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("1"))
//		mock.ExpectCommit()
//
//		body, _ := json.Marshal(newType)
//
//		w := httptest.NewRecorder()
//		req, _ := http.NewRequest("POST", "/api/v1/type", bytes.NewBuffer(body))
//		req.Header.Set("Content-Type", "application/json")
//
//		router.ServeHTTP(w, req)
//
//		assert.Equal(t, 201, w.Code)
//
//		if err := mock.ExpectationsWereMet(); err != nil {
//			t.Errorf("there were unfulfilled expectations: %s", err)
//		}
//	})
//}
//
//// TestTypeHandler_UpdateType is a test function that verifies the behavior of the UpdateType handler
//// in the TypeHandler. It tests whether the handler correctly updates a MoveType in the database
//// when the corresponding API endpoint is called. The test creates a mock database, sets up a test router,
//// and sends a HTTP PUT request with a request body containing the updated MoveType information.
//// The handler should update the MoveType in the database and return a 200 status code.
//// This function should be run as a subtest using the "go test" command.
//func TestTypeHandler_UpdateType(t *testing.T) {
//	router, mock, db := setupTest(t)
//	defer db.Close()
//	t.Run("should update type", func(t *testing.T) {
//		updatedType := models.MoveType{Name: "Water"}
//
//		row := sqlmock.NewRows([]string{"id", "name"}).AddRow("1", "Fire")
//		mock.ExpectQuery("SELECT * FROM \"moveTypes\" WHERE \"moveTypes\".\"id\" = $1 ORDER BY \"moveTypes\".\"id\" LIMIT $2").
//			WithArgs("1", 1).WillReturnRows(row)
//
//		mock.ExpectBegin()
//		mock.ExpectExec("UPDATE \"moveTypes\" SET \"name\"=$1 WHERE \"id\" = $2").
//			WithArgs(updatedType.Name, 1).
//			WillReturnResult(sqlmock.NewResult(1, 1))
//		mock.ExpectCommit()
//
//		body, _ := json.Marshal(updatedType)
//
//		w := httptest.NewRecorder()
//		req, _ := http.NewRequest("PUT", "/api/v1/type/1", bytes.NewBuffer(body))
//		req.Header.Set("Content-Type", "application/json")
//
//		router.ServeHTTP(w, req)
//
//		assert.Equal(t, 200, w.Code)
//
//		if err := mock.ExpectationsWereMet(); err != nil {
//			t.Errorf("there were unfulfilled expectations: %s", err)
//		}
//	})
//}
//
//// TestTypeHandler_DeleteType tests the DeleteType function of the TypeHandler.
//// It sets up a test environment, mocks the database, and performs a HTTP DELETE request to delete a type.
//// It verifies that the DELETE request returns a status code of 200.
//// If there are unfulfilled expectations in the mock, an error is logged.
//func TestTypeHandler_DeleteType(t *testing.T) {
//	router, mock, db := setupTest(t)
//	defer db.Close()
//	t.Run("should delete type", func(t *testing.T) {
//		expectedSQLSel := "SELECT * FROM \"moveTypes\" WHERE \"moveTypes\".\"id\" = $1 ORDER BY \"moveTypes\".\"id\" LIMIT $2"
//		mock.ExpectQuery(expectedSQLSel).WithArgs("1", 1).
//			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("1"))
//
//		expectedSQLDel := "DELETE FROM \"moveTypes\" WHERE \"moveTypes\".\"id\" = $1"
//
//		mock.ExpectBegin()
//		mock.ExpectExec(expectedSQLDel).
//			WithArgs(1).
//			WillReturnResult(sqlmock.NewResult(1, 1))
//		mock.ExpectCommit()
//
//		w := httptest.NewRecorder()
//		req, _ := http.NewRequest("DELETE", "/api/v1/type/1", nil)
//
//		router.ServeHTTP(w, req)
//
//		assert.Equal(t, 200, w.Code)
//
//		if err := mock.ExpectationsWereMet(); err != nil {
//			t.Errorf("there were unfulfilled expectations: %s", err)
//		}
//	})
//}

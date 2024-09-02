package controllers_test

import (
	"database/sql"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/JacobPotter/poke-db/api/routes"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"testing"
)

func setupTest(t *testing.T) (*gin.Engine, sqlmock.Sqlmock, *sql.DB) {
	mockDb, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))

	if err != nil {
		t.Fatalf("error creating mock database: %s", err)
	}

	if mockDb == nil {
		t.Fatal("mock db is null")
	}

	if mock == nil {
		t.Fatal("sqlmock is null")
	}

	dialector := postgres.New(postgres.Config{
		Conn: mockDb,
	})
	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		t.Fatalf("error connecting to database: %s", err)
	}

	router := routes.SetupRouter(db)
	return router, mock, mockDb
}

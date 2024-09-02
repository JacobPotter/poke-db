// Package models are the DB and data structures for the application
package models

import (
	_ "ariga.io/atlas-provider-gorm/gormschema"
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
)

var DB *gorm.DB

// ConnectDatabase establishes a connection to the database and performs necessary migrations.
// It initializes the `DB` variable with the connected database.
// If an error occurs during the connection or migration, a fatal log is generated.
func ConnectDatabase() {

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=postgres port=5432 sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
	)
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("failed to connect database: %v", err.Error())
	}

	err = database.AutoMigrate(&Pokemon{}, &Evolution{}, &EvolutionRequirement{}, &Move{}, &Type{})

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err.Error())
	}

	DB = database
}

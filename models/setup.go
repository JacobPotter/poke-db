// Package models are the DB and data structures for the application
package models

import (
	_ "ariga.io/atlas-provider-gorm/gormschema"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
)

var DB *gorm.DB

// ConnectDatabase establishes a connection to the database and performs necessary migrations.
// It initializes the `DB` variable with the connected database.
// If an error occurs during the connection or migration, a fatal log is generated.
func ConnectDatabase() {

	database, err := gorm.Open(sqlite.Open("pokemon.db"), &gorm.Config{})

	if err != nil {
		log.Fatalf("failed to connect database: %v", err.Error())
	}

	err = database.AutoMigrate(&Pokemon{}, &Evolution{}, &EvolutionRequirement{}, &Move{}, &Type{})

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err.Error())
	}

	DB = database
}

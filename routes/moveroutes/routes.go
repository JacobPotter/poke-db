package moveroutes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"poke-db/controllers"
)

func RegisterRoutes(router *gin.Engine, db *gorm.DB) {
	handler := controllers.NewMoveHandler(db)
	// Define routes
	router.POST("/moves", handler.CreateMove)
	router.GET("/moves/:id", handler.GetMove)
	router.GET("/moves", handler.ListMove)
	router.PUT("/moves/:id", handler.UpdateMove)
	router.DELETE("/moves/:id", handler.DeleteMove)
}

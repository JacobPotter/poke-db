package typeroutes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"poke-db/controllers"
)

func RegisterRoutes(router *gin.Engine, db *gorm.DB) {
	handler := controllers.NewTypeHandler(db)
	// Define routes
	router.POST("/type", handler.CreateType)
	router.GET("/type/:id", handler.GetType)
	router.GET("/type", handler.ListType)
	router.PUT("/type/:id", handler.UpdateType)
	router.DELETE("/type/:id", handler.DeleteType)
}

package typeroutes

import (
	"github.com/JacobPotter/poke-db/api/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB) {
	handler := controllers.NewTypeHandler(db)
	// Define routes
	router.POST("/type", handler.CreateType)
	router.GET("/type/:id", handler.GetType)
	router.GET("/type", handler.ListType)
	router.PUT("/type/:id", handler.UpdateType)
	router.DELETE("/type/:id", handler.DeleteType)
}

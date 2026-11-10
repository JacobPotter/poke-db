package healthroutes

import (
	"github.com/JacobPotter/poke-db/api/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterRoutes registers the health check routes on the given router or router group.
func RegisterRoutes(router gin.IRoutes, db *gorm.DB) {
	handler := controllers.NewHealthHandler(db)
	router.GET("/healthz", handler.Healthz)
}

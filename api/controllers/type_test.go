package controllers_test

import (
	"github.com/WebWizardsDev/poke-db/api/models"
	"github.com/WebWizardsDev/poke-db/api/routes"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
	"net/http"
	"net/http/httptest"
	"testing"
)

type TypeTestSuite struct {
	suite.Suite
	router *gin.Engine
}

func (s *TypeTestSuite) SetupTest() {
	// Setup code before each test
	models.ConnectDatabase()
	s.router = routes.SetupRouter(models.DB.Debug())

}

func TestTypeSuite(t *testing.T) {
	// Run the test suite
	suite.Run(t, new(TypeTestSuite))
}

func (s *TypeTestSuite) TestTypeHandler_ListType_Basic() {

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/type", nil)

	s.router.ServeHTTP(w, req)

	s.Equal(200, w.Code)

}

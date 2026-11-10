package controllers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/JacobPotter/poke-db/api/controllers"
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/JacobPotter/poke-db/api/routes"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHealthHandler_Unit(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := controllers.NewHealthHandler(nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	handler.Healthz(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp models.HealthResponse
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	assert.Equal(t, "ok", resp.Status)
}

func TestHealthRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := routes.SetupRouter(nil)

	t.Run("GET /healthz", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, err := http.NewRequest(http.MethodGet, "/healthz", nil)
		require.NoError(t, err)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp models.HealthResponse
		err = json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)
		assert.Equal(t, "ok", resp.Status)
	})

	t.Run("GET /api/v1/healthz", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, err := http.NewRequest(http.MethodGet, "/api/v1/healthz", nil)
		require.NoError(t, err)

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp models.HealthResponse
		err = json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)
		assert.Equal(t, "ok", resp.Status)
	})
}

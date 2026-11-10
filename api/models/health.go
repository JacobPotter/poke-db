package models

// HealthResponse represents the health check response payload.
type HealthResponse struct {
	Status string `json:"status" example:"ok"`
}

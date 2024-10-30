package controllers

import (
	"github.com/JacobPotter/poke-db/api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

// @BasePath /api/v1

// MoveHandler is responsible for handling move-related requests and operations.
// It contains methods for creating, getting, listing, updating, and deleting moves.
type MoveHandler struct {
	db *gorm.DB
}

// NewMoveHandler returns a new instance of MoveHandler with the provided database connection.
func NewMoveHandler(db *gorm.DB) *MoveHandler {
	return &MoveHandler{
		db: db,
	}
}

// CreateMove handles the creation of a new move.
// It takes a pointer to a gin Context as the parameter.
// It binds the JSON data from the request body to a Move object.
// If there is an error in binding, it returns a JSON response with the error message.
// Otherwise, it inserts the Move object into the database using the db connection.
// It then returns a JSON response with the created Move object.
//
// @Summary Creates Move
//
// @Description create a new move
//
// @Tags moves
//
// @Accept json
//
// @Produce json
//
// @Param data body models.Move true "The new move"
//
// @Success 201 {object} models.Move
//
// @Router /moves [post]
func (h *MoveHandler) CreateMove(c *gin.Context) {
	var move models.Move
	if err := c.ShouldBindJSON(&move); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Create(&move)
	c.JSON(http.StatusCreated, move)
}

// GetMove retrieves a move from the database based on the ID parameter in the request URL.
// If the move is found, it returns a JSON response with the move data.
// If the move is not found, it returns a JSON response with an error message.
//
// @Summary Get Move
//
// @Description Get move by ID
//
// @Tags moves
//
// @Accept json
//
// @Param id  path int true "Move ID"
//
// @Produce json
//
// @Success 200 {object} models.Move
//
// @Router /moves/{id} [get]
func (h *MoveHandler) GetMove(c *gin.Context) {
	id := c.Param("id")
	var move models.Move
	if err := h.db.First(&move, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Move not found"})
		return
	}
	c.JSON(http.StatusOK, move)
}

// ListMove retrieves a list of moves from the database and returns it as a JSON response.
// It retrieves all moves from the "moves" table using the db connection.
// If there is an error in fetching the moves, it returns a JSON response with an error message.
// Otherwise, it returns a JSON response with the list of moves.
//
// @Summary List Moves
//
// @Description List Moves
//
// @Tags moves
//
// @Accept json
//
// @Produce json
//
// @Success 200 {object} models.Moves
//
// @Router /moves [get]
func (h *MoveHandler) ListMove(c *gin.Context) {
	var moves []models.Move
	page, pageSize := models.GetPaginationQueryParams(c)
	if err := h.db.Scopes(models.Paginate(page, pageSize)).Find(&moves).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Moves"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"moves": moves})
}

// UpdateMove updates a move in the database. It takes the move ID from the request URL and retrieves the
// move from the database. If the move is not found, it returns a JSON response with an error message.
// It then binds the JSON data from the request body to an updatedMove object. If there is an error in binding,
// it returns a JSON response with the error message.
// Finally, it updates the move object in the database using the updatedMove object and returns a JSON response
// with the updated move data.
//
// @Summary Update Move
//
// @Description Update move by ID
//
// @Tags moves
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Move ID"
//
// @Param data body models.Move true "The updated move"
//
// @Success 200 {object} models.Move
//
// @Router /moves/{id} [put]
func (h *MoveHandler) UpdateMove(c *gin.Context) {
	id := c.Param("id")
	var move models.Move
	if err := h.db.First(&move, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Move not found"})
		return
	}

	var updatedMove models.Move
	if err := c.ShouldBindJSON(&updatedMove); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&move).Updates(updatedMove)
	c.JSON(http.StatusOK, updatedMove)
}

// DeleteMove deletes a move from the database based on the ID parameter in the request URL.
// It first retrieves the move from the database using the provided ID.
// If the move is not found, it returns a JSON response with an error message.
// Otherwise, it deletes the move from the database using the db connection.
// If there is an error in deleting the move, it returns a JSON response with an error message.
// Finally, it returns a JSON response indicating that the move was deleted successfully.
//
// @Summary Delete Move
//
// @Description Delete move by ID
//
// @Tags moves
//
// @Accept json
//
// @Produce json
//
// @Param id  path int true "Move ID"
//
// @Success 200 {string} string "deleted"
//
// @Router /moves/{id} [delete]
func (h *MoveHandler) DeleteMove(c *gin.Context) {
	id := c.Param("id")
	var move models.Move
	if err := h.db.First(&move, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Move not found"})
		return
	}

	if err := h.db.Delete(&move).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Move"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "Move deleted successfully"})
}

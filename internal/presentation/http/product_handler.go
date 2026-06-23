package http

import (
	"hanakori2/internal/application/product"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	getUseCase  *product.GetProductUseCase
	cartUseCase *product.CartUseCase
}

func NewProductHandler(g *product.GetProductUseCase, c *product.CartUseCase) *ProductHandler {
	return &ProductHandler{
		getUseCase:  g,
		cartUseCase: c,
	}
}

func (h *ProductHandler) HandleGetProducts(c *gin.Context) {
	category := c.Query("category")
	products, err := h.getUseCase.Execute(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) HandleGetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	p, err := h.getUseCase.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *ProductHandler) HandleGetCart(c *gin.Context) {
	c.JSON(http.StatusOK, h.cartUseCase.GetCartItems())
}

func (h *ProductHandler) HandleAddToCart(c *gin.Context) {
	var input struct {
		ProductID int `json:"product_id"`
		Quantity  int `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedCart, err := h.cartUseCase.AddToCart(input.ProductID, input.Quantity)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updatedCart)
}

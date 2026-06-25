package http

import (
	"hanakori2/internal/application/product"
	domainProduct "hanakori2/internal/domain/product"
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	getUseCase  *product.GetProductUseCase
	cartUseCase *product.CartUseCase

	cartSessionMu sync.RWMutex
	cartSessions  map[string][]domainProduct.CartItem
}

func NewProductHandler(g *product.GetProductUseCase, c *product.CartUseCase) *ProductHandler {
	return &ProductHandler{
		getUseCase:   g,
		cartUseCase:  c,
		cartSessions: make(map[string][]domainProduct.CartItem),
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
	sessionID := "default_user"

	h.cartSessionMu.RLock()
	currentCart := h.cartSessions[sessionID]
	if currentCart == nil {
		currentCart = []domainProduct.CartItem{}
	}
	h.cartSessionMu.RUnlock()

	c.JSON(http.StatusOK, currentCart)
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

	sessionID := "default_user"

	h.cartSessionMu.Lock()
	currentCart := h.cartSessions[sessionID]
	if currentCart == nil {
		currentCart = []domainProduct.CartItem{}
	}

	updatedCart, err := h.cartUseCase.AddToCart(currentCart, input.ProductID, input.Quantity)
	if err != nil {
		h.cartSessionMu.Unlock()
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.cartSessions[sessionID] = updatedCart
	h.cartSessionMu.Unlock()

	c.JSON(http.StatusOK, updatedCart)
}

func (h *ProductHandler) HandleGetSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"promo_banner": "特別キャンペーン: コード「PINK15」でトッピング無料！",
	})
}

func (h *ProductHandler) HandleUpdateSettings(c *gin.Context) {
	var input struct {
		PromoBanner string `json:"promo_banner"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Settings updated successfully!"})
}

func (h *ProductHandler) HandleAdminProductCRUD(c *gin.Context) {
	action := c.PostForm("action")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Operation '" + action + "' processed successfully!",
	})
}

func (h *ProductHandler) HandleClearCart(c *gin.Context) {
	sessionID := "default_user"

	h.cartSessionMu.Lock()
	// Clear the data by setting it to an empty slice
	h.cartSessions[sessionID] = []domainProduct.CartItem{}
	h.cartSessionMu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Backend cart session cleared successfully",
	})
}

func (h *ProductHandler) HandleRemoveFromCart(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	sessionID := "default_user"

	h.cartSessionMu.Lock()
	defer h.cartSessionMu.Unlock()

	currentCart := h.cartSessions[sessionID]
	var updatedCart []domainProduct.CartItem

	for _, item := range currentCart {
		if item.Product.MenuID != productID {
			updatedCart = append(updatedCart, item)
		}
	}

	h.cartSessions[sessionID] = updatedCart
	c.JSON(http.StatusOK, updatedCart)
}

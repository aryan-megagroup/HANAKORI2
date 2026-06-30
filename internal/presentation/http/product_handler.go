package http

import (
	"fmt"
	"hanakori2/internal/application/product"
	"hanakori2/internal/domain/order"
	domainProduct "hanakori2/internal/domain/product"
	domainPromo "hanakori2/internal/domain/promo"
	"net/http"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	getUseCase        *product.GetProductUseCase
	cartUseCase       *product.CartUseCase
	orderPromoUseCase *product.OrderPromoUseCase
	cartSessionMu     sync.RWMutex
	cartSessions      map[string][]domainProduct.CartItem
}

func NewProductHandler(g *product.GetProductUseCase, c *product.CartUseCase, op *product.OrderPromoUseCase) *ProductHandler {
	return &ProductHandler{
		getUseCase:        g,
		cartUseCase:       c,
		orderPromoUseCase: op,
		cartSessions:      make(map[string][]domainProduct.CartItem),
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

func (h *ProductHandler) HandleClearCart(c *gin.Context) {
	sessionID := "default_user"
	h.cartSessionMu.Lock()
	h.cartSessions[sessionID] = []domainProduct.CartItem{}
	h.cartSessionMu.Unlock()
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Backend cart session cleared successfully"})
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

func (h *ProductHandler) HandleAdminGetAllProducts(c *gin.Context) {
	products, err := h.orderPromoUseCase.AdminGetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) HandleManageProduct(c *gin.Context) {
	action := c.PostForm("action")
	if action == "delete" {
		idStr := c.PostForm("menu_id")
		id, _ := strconv.Atoi(idStr)
		if err := h.orderPromoUseCase.DeleteProduct(id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Item deleted successfully"})
		return
	}

	price, _ := strconv.Atoi(c.PostForm("price"))
	isAvailable := c.PostForm("is_available") == "1"

	p := &domainProduct.Product{
		Name:        c.PostForm("name"),
		Price:       price,
		Description: c.PostForm("description"),
		Category:    c.PostForm("category"),
		IsAvailable: isAvailable,
	}

	file, err := c.FormFile("image")
	if err == nil {
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
		savePath := filepath.Join("./public/uploads", filename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to save upload image"})
			return
		}
		p.ImageURL = "uploads/" + filename
	} else if action == "update" {
		idStr := c.PostForm("menu_id")
		id, _ := strconv.Atoi(idStr)
		existing, err := h.getUseCase.GetByID(id)
		if err == nil {
			p.ImageURL = existing.ImageURL
		}
	}

	if action == "update" {
		idStr := c.PostForm("menu_id")
		id, _ := strconv.Atoi(idStr)
		p.MenuID = id
		if err := h.orderPromoUseCase.UpdateProduct(p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Product updated successfully"})
	} else {
		if err := h.orderPromoUseCase.CreateProduct(p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Product created successfully"})
	}
}

func (h *ProductHandler) HandleGetAllPromos(c *gin.Context) {
	promos, err := h.orderPromoUseCase.GetAllPromos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, promos)
}

func (h *ProductHandler) HandleManagePromo(c *gin.Context) {
	var input struct {
		Action        string `json:"action"`
		PromoID       int    `json:"promo_id"`
		Code          string `json:"code"`
		Description   string `json:"description"`
		DiscountType  string `json:"discount_type"`
		DiscountValue int    `json:"discount_value"`
		IsActive      int    `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if input.Action == "delete" {
		if err := h.orderPromoUseCase.DeletePromo(input.PromoID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promo deleted successfully"})
		return
	}

	p := &domainPromo.PromoCode{
		PromoID:       input.PromoID,
		Code:          input.Code,
		Description:   input.Description,
		DiscountType:  input.DiscountType,
		DiscountValue: input.DiscountValue,
		IsActive:      input.IsActive == 1,
	}

	if input.Action == "update" {
		if err := h.orderPromoUseCase.UpdatePromo(p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promo updated successfully"})
		return
	}

	if err := h.orderPromoUseCase.CreatePromo(p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promo created successfully"})
}

func (h *ProductHandler) HandleGetOrders(c *gin.Context) {
	orders, err := h.orderPromoUseCase.GetAllOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totalEarnings := 0
	for _, o := range orders {
		if o.Status == "served" {
			totalEarnings += o.TotalPrice
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_earnings": totalEarnings,
		"orders":         orders,
	})
}

func (h *ProductHandler) HandleUpdateOrderStatus(c *gin.Context) {
	var input struct {
		OrderID int    `json:"order_id"`
		Status  string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := h.orderPromoUseCase.UpdateOrderStatus(input.OrderID, input.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Status updated successfully"})
}

func (h *ProductHandler) HandleSubmitOrderLine(c *gin.Context) {
	var input struct {
		OrderCode string `json:"order_code"`
		OrderType string `json:"order_type"`
		SeatNum   int    `json:"seat_number"`
		Total     int    `json:"total_price"`
		Status    string `json:"status"`
		Items     []struct {
			Name  string `json:"name"`
			Price int    `json:"price"`
			Qty   int    `json:"quantity"`
		} `json:"items"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	var domainItems []order.OrderItem
	for _, item := range input.Items {
		domainItems = append(domainItems, order.OrderItem{
			Name:     item.Name,
			Price:    item.Price,
			Quantity: item.Qty,
		})
	}

	o := &order.Order{
		OrderCode:  input.OrderCode,
		OrderType:  input.OrderType,
		SeatNumber: input.SeatNum,
		TotalPrice: input.Total,
		Status:     input.Status,
		CreatedAt:  time.Now(),
		Items:      domainItems,
	}

	if err := h.orderPromoUseCase.SubmitOrder(o); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Order persisted successfully"})
}

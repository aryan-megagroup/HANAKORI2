package http

import (
	"database/sql"
	"fmt"
	"hanakori2/internal/application/product"
	domainProduct "hanakori2/internal/domain/product"
	"net/http"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	getUseCase    *product.GetProductUseCase
	cartUseCase   *product.CartUseCase
	db            *sql.DB
	cartSessionMu sync.RWMutex
	cartSessions  map[string][]domainProduct.CartItem
}

func NewProductHandler(g *product.GetProductUseCase, c *product.CartUseCase, db *sql.DB) *ProductHandler {
	return &ProductHandler{
		getUseCase:   g,
		cartUseCase:  c,
		db:           db,
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
	repo, ok := h.getUseCase.GetRepo().(domainProduct.ProductRepository)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "repository configuration error"})
		return
	}

	products, err := repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) HandleManageProduct(c *gin.Context) {
	repo, ok := h.getUseCase.GetRepo().(domainProduct.ProductRepository)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "repository context error"})
		return
	}

	action := c.PostForm("action")
	if action == "delete" {
		idStr := c.PostForm("menu_id")
		id, _ := strconv.Atoi(idStr)
		if err := repo.Delete(id); err != nil {
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
		existing, err := repo.GetByID(id)
		if err == nil {
			p.ImageURL = existing.ImageURL
		}
	}

	if action == "update" {
		idStr := c.PostForm("menu_id")
		id, _ := strconv.Atoi(idStr)
		p.MenuID = id
		if err := repo.Update(p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Product updated successfully"})
	} else {
		if err := repo.Create(p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Product created successfully"})
	}
}

func (h *ProductHandler) HandleGetAllPromos(c *gin.Context) {
	rows, err := h.db.Query(`SELECT promo_id, code, description, discount_type, discount_value, is_active FROM promos`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var promos []gin.H
	for rows.Next() {
		var promoID, discountValue int
		var code, description, discountType string
		var isActive bool
		if err := rows.Scan(&promoID, &code, &description, &discountType, &discountValue, &isActive); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		promos = append(promos, gin.H{
			"promo_id":       promoID,
			"code":           code,
			"description":    description,
			"discount_type":  discountType,
			"discount_value": discountValue,
			"is_active":      isActive,
		})
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
		_, err := h.db.Exec(`DELETE FROM promos WHERE promo_id = ?`, input.PromoID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promo deleted successfully"})
		return
	}

	if input.Action == "update" {
		_, err := h.db.Exec(`UPDATE promos SET code = ?, description = ?, discount_type = ?, discount_value = ?, is_active = ? WHERE promo_id = ?`,
			input.Code, input.Description, input.DiscountType, input.DiscountValue, input.IsActive, input.PromoID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promo updated successfully"})
		return
	}

	_, err := h.db.Exec(`INSERT INTO promos (code, description, discount_type, discount_value, is_active) VALUES (?, ?, ?, ?, ?)`,
		input.Code, input.Description, input.DiscountType, input.DiscountValue, input.IsActive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promo created successfully"})
}

func (h *ProductHandler) HandleGetOrders(c *gin.Context) {
	rows, err := h.db.Query(`SELECT order_id, order_code, order_type, COALESCE(seat_number, 0), total_price, status, created_at FROM orders ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	orders := []gin.H{}
	totalEarnings := 0

	for rows.Next() {
		var orderID, seatNumber, totalPrice int
		var orderCode, orderType, status string
		var createdAt time.Time

		if err := rows.Scan(&orderID, &orderCode, &orderType, &seatNumber, &totalPrice, &status, &createdAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if status == "served" {
			totalEarnings += totalPrice
		}

		itemRows, err := h.db.Query(`SELECT name, price, quantity FROM order_items WHERE order_id = ?`, orderID)
		items := []gin.H{}
		if err == nil {
			for itemRows.Next() {
				var name string
				var price, quantity int
				if err := itemRows.Scan(&name, &price, &quantity); err == nil {
					items = append(items, gin.H{"name": name, "price": price, "quantity": quantity})
				}
			}
			itemRows.Close()
		}

		orders = append(orders, gin.H{
			"order_id":    orderID,
			"order_code":  orderCode,
			"order_type":  orderType,
			"seat_number": seatNumber,
			"total_price": totalPrice,
			"status":      status,
			"created_at":  createdAt.Format(time.RFC3339),
			"items":       items,
		})
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

	_, err := h.db.Exec(`UPDATE orders SET status = ? WHERE order_id = ?`, input.Status, input.OrderID)
	if err != nil {
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

	tx, err := h.db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	defer tx.Rollback()

	var res sql.Result
	res, err = tx.Exec(`INSERT INTO orders (order_code, order_type, seat_number, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
		input.OrderCode, input.OrderType, input.SeatNum, input.Total, input.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	orderID, _ := res.LastInsertId()

	for _, item := range input.Items {
		_, err = tx.Exec(`INSERT INTO order_items (order_id, name, price, quantity) VALUES (?, ?, ?, ?)`,
			orderID, item.Name, item.Price, item.Qty)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Order persisted successfully"})
}

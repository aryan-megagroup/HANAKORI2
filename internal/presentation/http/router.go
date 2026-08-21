package http

import (
	"os"

	"github.com/gin-gonic/gin"
)

func SetupRouter(handler *ProductHandler) *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
		if allowedOrigin == "" {
			allowedOrigin = "*"
		}

		c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	})

	// Legacy Static Assets
	r.Static("/css", "./public/css")
	r.Static("/js", "./public/js")
	r.Static("/uploads", "./public/uploads")
	r.StaticFile("/manager-script.js", "./public/js/manager-scrip.js")
	r.StaticFile("/manager-style.css", "./public/manager-style.css")

	// Legacy HTML Entry Points
	r.StaticFile("/manager.html", "./public/manager.html")
	r.StaticFile("/legacy.html", "./public/index.html")

	// React Frontend Assets
	r.Static("/assets", "./frontend/dist/assets")

	// API Routing
	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/products", handler.HandleGetProducts)
		apiGroup.GET("/products/:id", handler.HandleGetProductByID)
		apiGroup.GET("/cart", handler.HandleGetCart)
		apiGroup.POST("/cart", handler.HandleAddToCart)
		apiGroup.POST("/cart/clear", handler.HandleClearCart)
		apiGroup.DELETE("/cart/:id", handler.HandleRemoveFromCart)

		apiGroup.POST("/manage_products", handler.HandleManageProduct)

		apiGroup.GET("/get_promos", handler.HandleGetAllPromos)
		apiGroup.POST("/manage_promos", handler.HandleManagePromo)

		apiGroup.GET("/get_orders", handler.HandleGetOrders)
		apiGroup.POST("/update_order_status", handler.HandleUpdateOrderStatus)
		apiGroup.POST("/submit_order", handler.HandleSubmitOrderLine)
	}

	// React Catch-All (Must be at the end to support React Router)
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	return r
}

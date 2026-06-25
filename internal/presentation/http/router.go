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

	r.Static("/css", "./public/css")
	r.Static("/js", "./public/js")
	r.Static("/uploads", "./public/uploads")
	r.StaticFile("/manager-script.js", "./public/manager-script.js")
	r.StaticFile("/manager-style.css", "./public/manager-style.css")
	r.StaticFile("/", "./public/index.html")
	r.StaticFile("/manager", "./public/manager.html")

	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/products", handler.HandleGetProducts)
		apiGroup.GET("/products/:id", handler.HandleGetProductByID)
		apiGroup.GET("/cart", handler.HandleGetCart)
		apiGroup.POST("/cart", handler.HandleAddToCart)
		apiGroup.POST("/cart/clear", handler.HandleClearCart)
		apiGroup.DELETE("/cart/:id", handler.HandleRemoveFromCart)
	}

	return r
}

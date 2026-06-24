package http

import "github.com/gin-gonic/gin"

func SetupRouter(handler *ProductHandler) *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	})

	// 1. Serve directory assets
	r.Static("/css", "./public/css")
	r.Static("/js", "./public/js")
	r.Static("/uploads", "./public/uploads")

	// 2. Map direct static root files
	r.StaticFile("/manager-script.js", "./public/manager-script.js")
	r.StaticFile("/manager-style.css", "./public/manager-style.css")

	// 3. Map page entry templates
	r.StaticFile("/", "./public/index.html")
	r.StaticFile("/manager", "./public/manager.html")

	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/products", handler.HandleGetProducts)
		apiGroup.GET("/products/:id", handler.HandleGetProductByID)
		apiGroup.GET("/cart", handler.HandleGetCart)
		apiGroup.POST("/cart", handler.HandleAddToCart)
	}

	return r
}

package http

import "github.com/gin-gonic/gin"

func SetupRouter(handler *ProductHandler) *gin.Engine {
	r := gin.Default()

	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/products", handler.HandleGetProducts)
		apiGroup.GET("/products/:id", handler.HandleGetProductByID)

		apiGroup.GET("/cart", handler.HandleGetCart)
		apiGroup.POST("/cart", handler.HandleAddToCart)
	}

	return r
}

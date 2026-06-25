package main

import (
	"log"
	"os"

	"hanakori2/internal/application/product"
	"hanakori2/internal/infrastructure/database/repository"
	"hanakori2/internal/presentation/http"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	productRepo := repository.NewMySQLProductRepository()

	getUseCase := product.NewGetProductUseCase(productRepo)
	cartUseCase := product.NewCartUseCase(productRepo)

	productHandler := http.NewProductHandler(getUseCase, cartUseCase)

	r := http.SetupRouter(productHandler)

	log.Printf("Server starting on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

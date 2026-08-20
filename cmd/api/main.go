package main

import (
	"fmt"
	"log"
	"os"

	"hanakori2/internal/application/product"
	"hanakori2/internal/infrastructure/database"
	"hanakori2/internal/infrastructure/database/repository"
	"hanakori2/internal/presentation/http"
)

func main() {
	database.Connect()
	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		log.Fatal("CRITICAL CONFIGURATION ERROR: The 'BACKEND_PORT' variable is not defined.")
	}

	productRepo := repository.NewProductRepository(database.DB)
	promoRepo := repository.NewPromoRepository(database.DB)
	orderRepo := repository.NewOrderRepository(database.DB)

	getProductsUC := product.NewGetProductUseCase(productRepo)
	cartUC := product.NewCartUseCase(productRepo)
	orderPromoUC := product.NewOrderPromoUseCase(productRepo, promoRepo, orderRepo)

	handler := http.NewProductHandler(getProductsUC, cartUC, orderPromoUC)
	router := http.SetupRouter(handler)

	serverAddress := fmt.Sprintf(":%s", port)
	log.Printf("Server smoothly launched on environment address %s", serverAddress)

	if err := router.Run(serverAddress); err != nil {
		log.Fatalf("Failed to run backend engine: %v", err)
	}
}

package main

import (
	"fmt"
	"log"
	"os"

	"hanakori2/internal/application/product"

	"hanakori2/internal/infrastructure/database/repository"

	"hanakori2/internal/presentation/http"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found, defaulting to system environment variables")
	}

	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		log.Fatal("CRITICAL CONFIGURATION ERROR: The 'BACKEND_PORT' variable is not defined.")
	}

	productRepo := repository.NewMySQLProductRepository()

	getProductsUC := product.NewGetProductUseCase(productRepo)
	cartUC := product.NewCartUseCase(productRepo)

	handler := http.NewProductHandler(getProductsUC, cartUC)
	router := http.SetupRouter(handler)

	serverAddress := fmt.Sprintf(":%s", port)
	log.Printf("Server smoothly launched on environment address %s", serverAddress)

	if err := router.Run(serverAddress); err != nil {
		log.Fatalf("Failed to run backend engine: %v", err)
	}
}

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"hanakori2/internal/application/product"
	"hanakori2/internal/infrastructure/database/repository"
	"hanakori2/internal/presentation/http"

	_ "github.com/go-sql-driver/mysql"
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

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to initialize database driver connection: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Database is unreachable! Make sure your Docker container is running: %v", err)
	}

	productRepo := repository.NewMySQLProductRepository(db)
	promoRepo := repository.NewMySQLPromoRepository(db)
	orderRepo := repository.NewMySQLOrderRepository(db)

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

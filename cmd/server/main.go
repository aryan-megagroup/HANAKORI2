package main

import (
	"hanakori2/internal/application/product"
	"hanakori2/internal/infrastructure/database/repository"
	"hanakori2/internal/presentation/http"
)

func main() {
	productRepo := repository.NewMySQLProductRepository()

	getUseCase := product.NewGetProductUseCase(productRepo)
	cartUseCase := product.NewCartUseCase(productRepo)

	productHandler := http.NewProductHandler(getUseCase, cartUseCase)

	r := http.SetupRouter(productHandler)

	r.Run(":8081")
}

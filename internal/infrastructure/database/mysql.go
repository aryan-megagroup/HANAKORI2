package database

import "hanakori2/internal/domain/product"

type MySQLProductRepository struct{}

func NewMySQLProductRepository() *MySQLProductRepository {
	return &MySQLProductRepository{}
}

func (r *MySQLProductRepository) GetAllAvailable() ([]product.Product, error) {
	// This mock data addresses the "Product Menu" requirements
	return []product.Product{
		{MenuID: 1, Name: "Premium Matcha Latte", Price: 650, Category: "Drinks", IsAvailable: true},
		{MenuID: 2, Name: "Sakura Mochi Cake", Price: 550, Category: "Desserts", IsAvailable: true},
		{MenuID: 3, Name: "Classic Hojicha", Price: 480, Category: "Drinks", IsAvailable: true},
	}, nil
}

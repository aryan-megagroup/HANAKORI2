package repository

import "hanakori2/internal/domain/product"

type MySQLProductRepository struct{}

func NewMySQLProductRepository() *MySQLProductRepository {
	return &MySQLProductRepository{}
}

func (r *MySQLProductRepository) GetAllAvailable() ([]product.Product, error) {
	return []product.Product{
		{MenuID: 1, Name: "Strawberry Kakigori", Price: 650, Category: "kakigori", IsAvailable: true},
		{MenuID: 2, Name: "Chocolate Kakigori", Price: 550, Category: "kakigori", IsAvailable: true},
		{MenuID: 3, Name: "Sakura Mochi Cake", Price: 480, Category: "snacks", IsAvailable: true},
	}, nil
}

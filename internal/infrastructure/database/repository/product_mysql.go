package repository

import (
	"errors"
	"hanakori2/internal/domain/product"
)

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

// 追加：IDで直接商品を検索して返す（将来的にSQLの WHERE menu_id = ? になる部分）
func (r *MySQLProductRepository) GetByID(id int) (product.Product, error) {
	products, _ := r.GetAllAvailable()
	for _, p := range products {
		if p.MenuID == id {
			return p, nil
		}
	}
	return product.Product{}, errors.New("product not found")
}

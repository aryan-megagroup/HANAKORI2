package repository

import (
	"errors"
	"hanakori2/internal/domain/product"
	"net/url"

	"gorm.io/gorm"
)

type MySQLProductRepository struct {
	db *gorm.DB
}

func NewMySQLProductRepository(db *gorm.DB) *MySQLProductRepository {
	return &MySQLProductRepository{db: db}
}

func (r *MySQLProductRepository) GetByID(id int) (product.Product, error) {
	var p product.Product
	err := r.db.First(&p, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return p, errors.New("product not found")
	}
	return p, err
}

func (r *MySQLProductRepository) GetAll() ([]product.Product, error) {
	var products []product.Product
	err := r.db.Order("menu_id DESC").Find(&products).Error
	return products, err
}

func (r *MySQLProductRepository) GetAllAvailable() ([]product.Product, error) {
	var products []product.Product
	err := r.db.Where("is_available = ?", true).Order("menu_id DESC").Find(&products).Error
	return products, err
}

func (r *MySQLProductRepository) GetByCategory(category string) ([]product.Product, error) {
	var products []product.Product

	if category != "" {
		if decodedCategory, err := url.QueryUnescape(category); err == nil {
			category = decodedCategory
		}
	}

	err := r.db.Where("is_available = ? AND category = ?", true, category).
		Order("menu_id DESC").
		Find(&products).
		Error

	return products, err
}

func (r *MySQLProductRepository) Create(p *product.Product) error {
	return r.db.Create(p).Error
}

func (r *MySQLProductRepository) Update(p *product.Product) error {
	return r.db.Save(p).Error
}

func (r *MySQLProductRepository) Delete(id int) error {
	return r.db.Delete(&product.Product{}, id).Error
}

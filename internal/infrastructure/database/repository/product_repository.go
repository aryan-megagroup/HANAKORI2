package repository

import (
	"errors"
	"hanakori2/internal/domain/product"
	"net/url"

	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) GetByID(id int) (product.Product, error) {
	var p product.Product
	err := r.db.First(&p, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return p, errors.New("product not found")
	}
	return p, err
}

func (r *ProductRepository) GetAll() ([]product.Product, error) {
	var products []product.Product
	err := r.db.Order("menu_id DESC").Find(&products).Error
	return products, err
}

func (r *ProductRepository) GetAllAvailable() ([]product.Product, error) {
	var products []product.Product
	err := r.db.Where("is_available = ?", true).Order("menu_id DESC").Find(&products).Error
	return products, err
}

func (r *ProductRepository) GetByCategory(category string) ([]product.Product, error) {
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

func (r *ProductRepository) Create(p *product.Product) error {
	return r.db.Create(p).Error
}

func (r *ProductRepository) Update(p *product.Product) error {
	return r.db.Save(p).Error
}

func (r *ProductRepository) Delete(id int) error {
	return r.db.Delete(&product.Product{}, id).Error
}

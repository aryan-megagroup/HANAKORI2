package repository

import (
	"hanakori2/internal/domain/order"

	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) CreateOrder(o *order.Order) error {
	return r.db.Create(o).Error
}

func (r *OrderRepository) GetAllOrders() ([]order.Order, error) {
	var orders []order.Order
	err := r.db.Preload("Items").Order("created_at DESC").Find(&orders).Error
	return orders, err
}

func (r *OrderRepository) UpdateStatus(id int, status string) error {
	return r.db.Model(&order.Order{}).Where("order_id = ?", id).Update("status", status).Error
}

package repository

import (
	"hanakori2/internal/domain/order"

	"gorm.io/gorm"
)

type MySQLOrderRepository struct {
	db *gorm.DB
}

func NewMySQLOrderRepository(db *gorm.DB) *MySQLOrderRepository {
	return &MySQLOrderRepository{db: db}
}

func (r *MySQLOrderRepository) CreateOrder(o *order.Order) error {
	return r.db.Create(o).Error
}

func (r *MySQLOrderRepository) GetAllOrders() ([]order.Order, error) {
	var orders []order.Order
	err := r.db.Preload("Items").Order("created_at DESC").Find(&orders).Error
	return orders, err
}

func (r *MySQLOrderRepository) UpdateStatus(id int, status string) error {
	return r.db.Model(&order.Order{}).Where("order_id = ?", id).Update("status", status).Error
}

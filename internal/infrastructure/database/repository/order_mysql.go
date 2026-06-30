package repository

import (
	"database/sql"
	"hanakori2/internal/domain/order"
)

type MySQLOrderRepository struct {
	db *sql.DB
}

func NewMySQLOrderRepository(db *sql.DB) *MySQLOrderRepository {
	return &MySQLOrderRepository{db: db}
}

func (r *MySQLOrderRepository) CreateOrder(o *order.Order) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	queryOrder := `INSERT INTO orders (order_code, order_type, seat_number, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`
	res, err := tx.Exec(queryOrder, o.OrderCode, o.OrderType, o.SeatNumber, o.TotalPrice, o.Status, o.CreatedAt)
	if err != nil {
		return err
	}

	orderID, err := res.LastInsertId()
	if err != nil {
		return err
	}
	o.OrderID = int(orderID)

	queryItem := `INSERT INTO order_items (order_id, name, price, quantity) VALUES (?, ?, ?, ?)`
	for _, item := range o.Items {
		_, err := tx.Exec(queryItem, o.OrderID, item.Name, item.Price, item.Quantity)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *MySQLOrderRepository) GetAllOrders() ([]order.Order, error) {
	query := `SELECT order_id, order_code, order_type, COALESCE(seat_number, 0), total_price, status, created_at FROM orders ORDER BY created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []order.Order
	for rows.Next() {
		var o order.Order
		if err := rows.Scan(&o.OrderID, &o.OrderCode, &o.OrderType, &o.SeatNumber, &o.TotalPrice, &o.Status, &o.CreatedAt); err != nil {
			return nil, err
		}

		itemQuery := `SELECT name, price, quantity FROM order_items WHERE order_id = ?`
		itemRows, err := r.db.Query(itemQuery, o.OrderID)
		if err == nil {
			for itemRows.Next() {
				var item order.OrderItem
				if err := itemRows.Scan(&item.Name, &item.Price, &item.Quantity); err == nil {
					o.Items = append(o.Items, item)
				}
			}
			itemRows.Close()
		}
		orders = append(orders, o)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *MySQLOrderRepository) UpdateStatus(id int, status string) error {
	query := `UPDATE orders SET status = ? WHERE order_id = ?`
	_, err := r.db.Exec(query, status, id)
	return err
}

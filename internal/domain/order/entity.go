package order

import "time"

type OrderItem struct {
	Name     string `json:"name"`
	Price    int    `json:"price"`
	Quantity int    `json:"quantity"`
}

type Order struct {
	OrderID    int         `json:"order_id"`
	OrderCode  string      `json:"order_code"`
	OrderType  string      `json:"order_type"`
	SeatNumber int         `json:"seat_number"`
	TotalPrice int         `json:"total_price"`
	Status     string      `json:"status"`
	CreatedAt  time.Time   `json:"created_at"`
	Items      []OrderItem `json:"items"`
}

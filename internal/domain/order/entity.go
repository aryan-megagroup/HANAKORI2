package order

import "time"

type OrderItem struct {
	ItemID   int    `gorm:"primaryKey;autoIncrement;column:item_id" json:"-"`
	OrderID  int    `gorm:"index;not null;column:order_id" json:"-"`
	Name     string `gorm:"type:varchar(100);not null" json:"name"`
	Price    int    `gorm:"not null" json:"price"`
	Quantity int    `gorm:"not null" json:"quantity"`
}

type Order struct {
	OrderID    int         `gorm:"primaryKey;autoIncrement;column:order_id" json:"order_id"`
	OrderCode  string      `gorm:"type:varchar(20);uniqueIndex;not null" json:"order_code"`
	OrderType  string      `gorm:"type:varchar(20);not null" json:"order_type"`
	SeatNumber int         `json:"seat_number"`
	TotalPrice int         `gorm:"not null" json:"total_price"`
	Status     string      `gorm:"type:varchar(20);default:'pending'" json:"status"`
	CreatedAt  time.Time   `gorm:"autoCreateTime" json:"created_at"`
	Items      []OrderItem `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items"`
}

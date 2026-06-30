package order

type Repository interface {
	CreateOrder(o *Order) error
	GetAllOrders() ([]Order, error)
	UpdateStatus(id int, status string) error
}

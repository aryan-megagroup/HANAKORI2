package product

type ProductRepository interface {
	GetAllAvailable() ([]Product, error)
}

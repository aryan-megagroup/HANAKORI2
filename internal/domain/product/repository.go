package product

type ProductRepository interface {
	GetAllAvailable() ([]Product, error)
	GetByID(id int) (Product, error) // 追加
}

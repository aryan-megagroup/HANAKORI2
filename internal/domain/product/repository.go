package product

type ProductRepository interface {
	GetByID(id int) (Product, error)
	GetAll() ([]Product, error)
	GetAllAvailable() ([]Product, error)
	GetByCategory(category string) ([]Product, error)
	Create(p *Product) error
	Update(p *Product) error
	Delete(id int) error
}

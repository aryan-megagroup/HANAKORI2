package product

type ProductRepository interface {
	GetByID(id int) (Product, error)
	GetAllAvailable() ([]Product, error)
	GetAll() ([]Product, error)
	Create(p *Product) error
	Update(p *Product) error
	Delete(id int) error
}

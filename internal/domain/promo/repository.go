package promo

type PromoRepository interface {
	GetAll() ([]PromoCode, error)
	GetByCode(code string) (PromoCode, error)
	Create(p *PromoCode) error
	Update(p *PromoCode) error
	Delete(id int) error
}

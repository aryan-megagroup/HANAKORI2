package product

import (
	"hanakori2/internal/domain/order"
	"hanakori2/internal/domain/product"
	"hanakori2/internal/domain/promo"
)

type OrderPromoUseCase struct {
	productRepo product.ProductRepository
	promoRepo   promo.PromoRepository
	orderRepo   order.OrderRepository
}

func NewOrderPromoUseCase(pRepo product.ProductRepository, prRepo promo.PromoRepository, oRepo order.OrderRepository) *OrderPromoUseCase {
	return &OrderPromoUseCase{
		productRepo: pRepo,
		promoRepo:   prRepo,
		orderRepo:   oRepo,
	}
}

func (uc *OrderPromoUseCase) GetAllPromos() ([]promo.PromoCode, error) {
	return uc.promoRepo.GetAll()
}

func (uc *OrderPromoUseCase) CreatePromo(p *promo.PromoCode) error {
	return uc.promoRepo.Create(p)
}

func (uc *OrderPromoUseCase) UpdatePromo(p *promo.PromoCode) error {
	return uc.promoRepo.Update(p)
}

func (uc *OrderPromoUseCase) DeletePromo(id int) error {
	return uc.promoRepo.Delete(id)
}

func (uc *OrderPromoUseCase) GetAllOrders() ([]order.Order, error) {
	return uc.orderRepo.GetAllOrders()
}

func (uc *OrderPromoUseCase) UpdateOrderStatus(id int, status string) error {
	return uc.orderRepo.UpdateStatus(id, status)
}

func (uc *OrderPromoUseCase) SubmitOrder(o *order.Order) error {
	return uc.orderRepo.CreateOrder(o)
}

func (uc *OrderPromoUseCase) AdminGetAllProducts() ([]product.Product, error) {
	return uc.productRepo.GetAll()
}

func (uc *OrderPromoUseCase) CreateProduct(p *product.Product) error {
	return uc.productRepo.Create(p)
}

func (uc *OrderPromoUseCase) UpdateProduct(p *product.Product) error {
	return uc.productRepo.Update(p)
}

func (uc *OrderPromoUseCase) DeleteProduct(id int) error {
	return uc.productRepo.Delete(id)
}

package product

import (
	"errors"
	"hanakori2/internal/domain/product"
)

type CartUseCase struct {
	repo  product.ProductRepository
	items []product.CartItem // Simple in-memory storage for checkout simulation
}

func NewCartUseCase(repo product.ProductRepository) *CartUseCase {
	return &CartUseCase{
		repo:  repo,
		items: []product.CartItem{},
	}
}

func (uc *CartUseCase) GetCartItems() []product.CartItem {
	return uc.items
}

func (uc *CartUseCase) AddToCart(productID int, qty int) ([]product.CartItem, error) {
	products, err := uc.repo.GetAllAvailable()
	if err != nil {
		return nil, err
	}

	var targetProduct product.Product
	found := false
	for _, p := range products {
		if p.MenuID == productID {
			targetProduct = p
			found = true
			break
		}
	}

	if !found {
		return nil, errors.New("product not found to add to cart")
	}

	for i, item := range uc.items {
		if item.Product.MenuID == productID {
			uc.items[i].Quantity += qty
			return uc.items, nil
		}
	}

	uc.items = append(uc.items, product.CartItem{Product: targetProduct, Quantity: qty})
	return uc.items, nil
}

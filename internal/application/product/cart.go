package product

import (
	"errors"
	"hanakori2/internal/domain/product"
)

type CartUseCase struct {
	repo product.ProductRepository
}

func NewCartUseCase(repo product.ProductRepository) *CartUseCase {
	return &CartUseCase{
		repo: repo,
	}
}

func (uc *CartUseCase) AddToCart(currentCart []product.CartItem, productID int, qty int) ([]product.CartItem, error) {
	if qty <= 0 {
		return nil, errors.New("quantity must be positive")
	}

	targetProduct, err := uc.repo.GetByID(productID)
	if err != nil {
		return nil, err
	}

	if !targetProduct.IsAvailable {
		return nil, errors.New("product is currently sold out")
	}

	for i, item := range currentCart {
		if item.Product.MenuID == productID {
			currentCart[i].Quantity += qty
			return currentCart, nil
		}
	}

	updatedCart := append(currentCart, product.CartItem{
		Product:  targetProduct,
		Quantity: qty,
	})

	return updatedCart, nil
}

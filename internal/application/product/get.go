package product

import (
	"hanakori2/internal/domain/product"
)

type GetProductUseCase struct {
	repo product.ProductRepository
}

func NewGetProductUseCase(repo product.ProductRepository) *GetProductUseCase {
	return &GetProductUseCase{repo: repo}
}

func (uc *GetProductUseCase) Execute(category string) ([]product.Product, error) {
	products, err := uc.repo.GetAllAvailable()
	if err != nil {
		return nil, err
	}

	if category == "" {
		return products, nil
	}

	var filtered []product.Product
	for _, p := range products {
		if p.Category == category {
			filtered = append(filtered, p)
		}
	}
	return filtered, nil
}

func (uc *GetProductUseCase) GetByID(id int) (product.Product, error) {
	return uc.repo.GetByID(id)
}

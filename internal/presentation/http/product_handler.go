package http

import (
	"encoding/json"
	"net/http"
)

type Product struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Price int    `json:"price"`
}

type ProductHandler struct{}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{}
}

func (h *ProductHandler) GetSampleProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	products := []Product{
		{ID: 1, Name: "Sample Product A", Price: 1500},
		{ID: 2, Name: "Sample Product B", Price: 2800},
	}

	json.NewEncoder(w).Encode(products)
}

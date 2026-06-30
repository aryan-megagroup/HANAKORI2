package http

import (
	"net/http"
)

func SetupRouter() *http.ServeMux {
	mux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("./public"))
	mux.Handle("/", fileServer)

	productHandler := NewProductHandler()
	mux.HandleFunc("/api/products", productHandler.GetSampleProducts)

	return mux
}

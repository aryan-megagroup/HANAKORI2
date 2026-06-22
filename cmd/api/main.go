package main

import (
	presentation "hanakori2/internal/presentation/http"
	"log"
	"net/http"
)

func main() {
	router := presentation.SetupRouter()

	log.Println("Server starting on http://localhost:8081 ...")
	err := http.ListenAndServe(":8081", router)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

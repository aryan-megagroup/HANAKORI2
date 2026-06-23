package main

import (
	"log"
	"net/http"
	"os"

	presentation "hanakori2/internal/presentation/http"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	router := presentation.SetupRouter()

	log.Printf("Server starting on http://localhost:%s ...\n", port)

	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

package product

type Product struct {
	MenuID      int    `json:"MenuID"`
	Name        string `json:"Name"`
	Price       int    `json:"Price"`
	Category    string `json:"Category"`
	IsAvailable bool   `json:"IsAvailable"`
}

type CartItem struct {
	Product  Product `json:"Product"`
	Quantity int     `json:"Quantity"`
}

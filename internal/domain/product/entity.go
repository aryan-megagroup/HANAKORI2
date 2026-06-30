package product

type Product struct {
	MenuID      int    `json:"MenuID"`
	Name        string `json:"Name"`
	Price       int    `json:"Price"`
	Description string `json:"Description"`
	Category    string `json:"Category"`
	ImageURL    string `json:"ImageURL"`
	IsAvailable bool   `json:"IsAvailable"`
}

type CartItem struct {
	Product  Product `json:"Product"`
	Quantity int     `json:"Quantity"`
}

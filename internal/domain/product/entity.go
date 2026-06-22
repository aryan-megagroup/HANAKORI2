package product
type Product struct {
	MenuID int 'json:"menu_id"'
	Name string 'json:"name"'
	Price int 'json:"price"'
	Category string 'json:"category"'
	Isavailable bool 'json:"is_available"`
}


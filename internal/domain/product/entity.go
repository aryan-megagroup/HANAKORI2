package product

type Product struct {
	MenuID      int    `gorm:"primaryKey;autoIncrement;column:menu_id" json:"MenuID"`
	Name        string `gorm:"type:varchar(100);not null" json:"Name"`
	Price       int    `gorm:"not null" json:"Price"`
	Description string `gorm:"type:text" json:"Description"`
	Category    string `gorm:"type:varchar(50)" json:"Category"`
	ImageURL    string `gorm:"type:varchar(255)" json:"ImageURL"`
	IsAvailable bool   `gorm:"default:true" json:"IsAvailable"`
}

type CartItem struct {
	Product  Product `gorm:"-" json:"Product"`
	Quantity int     `gorm:"-" json:"Quantity"`
}

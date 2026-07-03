package promo

type PromoCode struct {
	PromoID       int    `gorm:"primaryKey;autoIncrement;column:promo_id" json:"promo_id"`
	Code          string `gorm:"type:varchar(50);unique;not null" json:"code"`
	Description   string `gorm:"type:text" json:"description"`
	DiscountType  string `gorm:"type:varchar(20);not null" json:"discount_type"`
	DiscountValue int    `gorm:"not null" json:"discount_value"`
	IsActive      bool   `gorm:"default:true" json:"is_active"`
}

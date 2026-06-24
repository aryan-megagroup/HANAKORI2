// internal/domain/promo/entity.go
package promo

type PromoCode struct {
	PromoID       int    `json:"promo_id"`
	Code          string `json:"code"`
	Description   string `json:"description"`
	DiscountType  string `json:"discount_type"` // "percentage" or "fixed"
	DiscountValue int    `json:"discount_value"`
	IsActive      bool   `json:"is_active"`
}

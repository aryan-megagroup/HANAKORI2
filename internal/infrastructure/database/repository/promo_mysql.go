package repository

import (
	"errors"
	"hanakori2/internal/domain/promo"

	"gorm.io/gorm"
)

type MySQLPromoRepository struct {
	db *gorm.DB
}

func NewMySQLPromoRepository(db *gorm.DB) *MySQLPromoRepository {
	return &MySQLPromoRepository{db: db}
}

func (r *MySQLPromoRepository) GetAll() ([]promo.PromoCode, error) {
	var promos []promo.PromoCode
	err := r.db.Find(&promos).Error
	return promos, err
}

func (r *MySQLPromoRepository) GetByCode(code string) (promo.PromoCode, error) {
	var p promo.PromoCode
	err := r.db.Where("code = ?", code).First(&p).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return p, errors.New("promo code not found")
	}
	return p, err
}

func (r *MySQLPromoRepository) Create(p *promo.PromoCode) error {
	return r.db.Create(p).Error
}

func (r *MySQLPromoRepository) Update(p *promo.PromoCode) error {
	return r.db.Save(p).Error
}

func (r *MySQLPromoRepository) Delete(id int) error {
	return r.db.Delete(&promo.PromoCode{}, id).Error
}

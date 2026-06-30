package repository

import (
	"database/sql"
	"errors"
	"hanakori2/internal/domain/promo"
)

type MySQLPromoRepository struct {
	db *sql.DB
}

func NewMySQLPromoRepository(db *sql.DB) *MySQLPromoRepository {
	return &MySQLPromoRepository{db: db}
}

func (r *MySQLPromoRepository) GetAll() ([]promo.PromoCode, error) {
	query := `SELECT promo_id, code, description, discount_type, discount_value, is_active FROM promos`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var promos []promo.PromoCode
	for rows.Next() {
		var p promo.PromoCode
		if err := rows.Scan(&p.PromoID, &p.Code, &p.Description, &p.DiscountType, &p.DiscountValue, &p.IsActive); err != nil {
			return nil, err
		}
		promos = append(promos, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return promos, nil
}

func (r *MySQLPromoRepository) GetByCode(code string) (promo.PromoCode, error) {
	var p promo.PromoCode
	query := `SELECT promo_id, code, description, discount_type, discount_value, is_active FROM promos WHERE code = ?`
	err := r.db.QueryRow(query, code).Scan(&p.PromoID, &p.Code, &p.Description, &p.DiscountType, &p.DiscountValue, &p.IsActive)
	if err == sql.ErrNoRows {
		return p, errors.New("promo code not found")
	}
	return p, err
}

func (r *MySQLPromoRepository) Create(p *promo.PromoCode) error {
	query := `INSERT INTO promos (code, description, discount_type, discount_value, is_active) VALUES (?, ?, ?, ?, ?)`
	res, err := r.db.Exec(query, p.Code, p.Description, p.DiscountType, p.DiscountValue, p.IsActive)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	p.PromoID = int(id)
	return nil
}

func (r *MySQLPromoRepository) Update(p *promo.PromoCode) error {
	query := `UPDATE promos SET code = ?, description = ?, discount_type = ?, discount_value = ?, is_active = ? WHERE promo_id = ?`
	_, err := r.db.Exec(query, p.Code, p.Description, p.DiscountType, p.DiscountValue, p.IsActive, p.PromoID)
	return err
}

func (r *MySQLPromoRepository) Delete(id int) error {
	query := `DELETE FROM promos WHERE promo_id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

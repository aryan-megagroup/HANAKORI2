package repository

import (
	"database/sql"
	"errors"
	"hanakori2/internal/domain/product"
)

type MySQLProductRepository struct {
	db *sql.DB
}

func NewMySQLProductRepository(db *sql.DB) *MySQLProductRepository {
	return &MySQLProductRepository{db: db}
}

func (r *MySQLProductRepository) GetByID(id int) (product.Product, error) {
	var p product.Product
	query := `SELECT menu_id, name, price, description, category, image_url, is_available FROM products WHERE menu_id = ?`
	err := r.db.QueryRow(query, id).Scan(&p.MenuID, &p.Name, &p.Price, &p.Description, &p.Category, &p.ImageURL, &p.IsAvailable)
	if err == sql.ErrNoRows {
		return p, errors.New("product not found")
	}
	return p, err
}

func (r *MySQLProductRepository) GetAll() ([]product.Product, error) {
	query := `SELECT menu_id, name, price, description, category, image_url, is_available FROM products ORDER BY menu_id DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []product.Product{}
	for rows.Next() {
		var p product.Product
		if err := rows.Scan(&p.MenuID, &p.Name, &p.Price, &p.Description, &p.Category, &p.ImageURL, &p.IsAvailable); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return products, nil
}

func (r *MySQLProductRepository) GetAllAvailable() ([]product.Product, error) {
	query := `SELECT menu_id, name, price, description, category, image_url, is_available FROM products ORDER BY menu_id DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []product.Product
	for rows.Next() {
		var p product.Product
		if err := rows.Scan(&p.MenuID, &p.Name, &p.Price, &p.Description, &p.Category, &p.ImageURL, &p.IsAvailable); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return products, nil
}

func (r *MySQLProductRepository) Create(p *product.Product) error {
	query := `INSERT INTO products (name, price, description, category, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)`
	res, err := r.db.Exec(query, p.Name, p.Price, p.Description, p.Category, p.ImageURL, p.IsAvailable)
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err == nil {
		p.MenuID = int(id)
	}
	return nil
}

func (r *MySQLProductRepository) Update(p *product.Product) error {
	query := `UPDATE products SET name = ?, price = ?, description = ?, category = ?, image_url = ?, is_available = ? WHERE menu_id = ?`
	_, err := r.db.Exec(query, p.Name, p.Price, p.Description, p.Category, p.ImageURL, p.IsAvailable, p.MenuID)
	return err
}

func (r *MySQLProductRepository) Delete(id int) error {
	query := `DELETE FROM products WHERE menu_id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"hanakori2/internal/domain/order"
	"hanakori2/internal/domain/product"
	"hanakori2/internal/domain/promo"
)

var DB *gorm.DB

func Connect() {
	_ = godotenv.Load()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect to database: ", err)
	}
	log.Println("✅ Successfully connected to the database!")

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(25)
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	err = db.AutoMigrate(
		&product.Product{},
		&promo.PromoCode{},
		&order.Order{},
		&order.OrderItem{},
	)
	if err != nil {
		log.Fatal("❌ Failed to migrate database schema: ", err)
	}
	log.Println("✅ Database schema migrated successfully!")

	DB = db

	seedProducts(db)
}

func seedProducts(db *gorm.DB) {
	var count int64
	db.Model(&product.Product{}).Count(&count)

	if count == 0 {
		log.Println("🌱 Database is empty. Seeding matching category items...")
		products := []product.Product{
			{Name: "いちごかき氷", Price: 600, Category: "かき氷本体", Description: "果肉たっぷりのいちごソースをかけた定番かき氷。", ImageURL: "uploads/いちごソース.png", IsAvailable: true},
			{Name: "宇治金時抹茶", Price: 750, Category: "かき氷本体", Description: "高級宇治抹茶と濃厚な粒あんの贅沢な味わい。", ImageURL: "uploads/宇治金時抹茶.png", IsAvailable: true},
			{Name: "マンゴーかき氷", Price: 700, Category: "かき氷本体", Description: "濃厚でトロピカルな完熟マンゴーソースかき氷。", ImageURL: "uploads/マンゴー.png", IsAvailable: true},
			{Name: "メロンかき氷", Price: 650, Category: "かき氷本体", Description: "フルーティーな甘さの特製メロンソースかき氷。", ImageURL: "uploads/メロンソース.png", IsAvailable: true},
			{Name: "ブルーハワイ", Price: 500, Category: "かき氷本体", Description: "お祭り気分を味わえる爽快ブルーハワイシロップ。", ImageURL: "uploads/ブルーハワイ.png", IsAvailable: true},
			{Name: "ピーチかき氷", Price: 700, Category: "かき氷本体", Description: "上品な甘さの国産桃ソースを使用したかき氷。", ImageURL: "uploads/桃.png", IsAvailable: true},
			{Name: "チョコミント氷", Price: 650, Category: "かき氷本体", Description: "爽やかなミントシロップ and パリパリチョコチップの組み合わせ。", ImageURL: "uploads/チョコミント.png", IsAvailable: true},
			{Name: "コーヒーチョコ氷", Price: 650, Category: "かき氷本体", Description: "ほろ苦いコーヒーシロップとチョコの大人なかき氷。", ImageURL: "uploads/コーヒーチョコレート.png", IsAvailable: true},
			{Name: "レモンかき氷", Price: 600, Category: "かき氷本体", Description: "すっきり爽快な地中海レモンソース仕立て。", ImageURL: "uploads/レモンソース.png", IsAvailable: true},
			{Name: "レインボーかき氷", Price: 650, Category: "かき氷本体", Description: "見た目も華やかなカラフルレインボーソース。", ImageURL: "uploads/レインボーソース.png", IsAvailable: true},

			{Name: "特製わらび餅", Price: 400, Category: "スナック", Description: "ぷるぷる食感のきな粉と黒蜜のわらび餅セット。", ImageURL: "uploads/わらび餅.png", IsAvailable: true},
			{Name: "さくらもちセット", Price: 450, Category: "スナック", Description: "ほんのり桜が香る伝統的な和菓子セット。", ImageURL: "uploads/さくらもち.png", IsAvailable: true},
			{Name: "和風特製モンブラン", Price: 800, Category: "スナック", Description: "和栗の風味豊かな高級モンブラデザート。", ImageURL: "uploads/モンブラン.png", IsAvailable: true},
			{Name: "はちみつバニラアイスプレート", Price: 350, Category: "スナック", Description: "特製はちみつを贅沢にかけたバニラアイスクリーム。", ImageURL: "uploads/はちみつバニラアイス単品.png", IsAvailable: true},
		}

		if err := db.Create(&products).Error; err != nil {
			log.Printf("❌ Failed to seed menu items: %v", err)
		} else {
			log.Println("✅ Fully matched database items seeded successfully!")
		}
	}
}

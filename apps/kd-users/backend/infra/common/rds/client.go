package rds

import (
	"fmt"
	"kd-users/config"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/plugin/dbresolver"
)

type DBConn struct {
	Conn       *gorm.DB // cluster endpoint
	ReaderConn *gorm.DB // reader endpoint
}

type RdsClient struct {
	DBConn DBConn
}

func NewRdsClient(conf config.Config) RdsClient {
	cluseterEndpoint := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=true",
		conf.DBUser,
		conf.DBPassword,
		conf.DBHost,
		conf.DBPort,
		conf.DBName,
	)

	// TODO: 3回までリトライする
	db, err := gorm.Open(mysql.Open(cluseterEndpoint), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	err = db.Use(dbresolver.Register(dbresolver.Config{
		// Replicas:          []gorm.Dialector{mysql.Open(dsn)}, // TODO: reader endpoint を追加する
		Policy:            dbresolver.RandomPolicy{},
		TraceResolverMode: true,
	}).
		// TODO: 値は仮。
		// TODO: 値を config から読み込み環境ごとに変更できるようにする
		SetMaxOpenConns(10).
		SetConnMaxLifetime(24 * time.Hour).
		SetMaxIdleConns(10).
		SetConnMaxIdleTime(30 * time.Minute),
	)
	if err != nil {
		panic(err)
	}

	return RdsClient{DBConn: DBConn{Conn: db}}
}

package rds

import (
	"fmt"
	"kd-users/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
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

	// TODO: reader endpoint を追加する

	return RdsClient{DBConn: DBConn{Conn: db}}
}

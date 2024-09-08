package rds

import (
	"context"
	"encoding/json"
	"fmt"
	"kd-users/config"
	"strconv"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/plugin/dbresolver"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type DBConn struct {
	Conn       *gorm.DB // cluster endpoint
	ReaderConn *gorm.DB // reader endpoint
}

type RdsClient struct {
	DBConn DBConn
}

func NewRdsClient(conf config.Config) RdsClient {
	secret := getCredentials(conf)

	cluseterEndpoint := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=true",
		secret.Username,
		secret.Password,
		secret.Host,
		strconv.FormatInt(secret.Port, 10),
		secret.DBName,
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

func getCredentials(conf config.Config) DBSecret {
	secretName := conf.DBSecretName

	c, err := awsConfig.LoadDefaultConfig(context.TODO(), awsConfig.WithRegion(conf.Region))
	if err != nil {
		panic("failed to load config: " + err.Error())
	}

	client := secretsmanager.NewFromConfig(c)

	input := &secretsmanager.GetSecretValueInput{
		SecretId:     aws.String(secretName),
		VersionStage: aws.String("AWSCURRENT"),
	}

	result, err := client.GetSecretValue(context.TODO(), input)
	if err != nil {
		panic("failed to get secret value: " + err.Error())
	}

	secretString := result.SecretString
	if secretString == nil {
		panic("secret string is nil")
	}

	secret := DBSecret{}
	err = json.Unmarshal([]byte(*secretString), &secret)
	if err != nil {
		panic("failed to unmarshal secret: " + err.Error())
	}

	return secret
}

type DBSecret struct {
	DBClusterIdentifier string `json:"dbClusterIdentifier"`
	Password            string `json:"password"`
	DBName              string `json:"dbname"`
	Engine              string `json:"engine"`
	Port                int64  `json:"port"`
	Host                string `json:"host"`
	Username            string `json:"username"`
}

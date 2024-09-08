package config

import (
	"fmt"
	"os"
)

type EnvironmentVariables struct {
	Env          string
	Region       string
	DBSecretName string
}

func LoadEnvironmentVariables() EnvironmentVariables {
	env := mustGetEnv("ENV")
	region := mustGetEnv("REGION")
	dbSecretName := mustGetEnv("DB_SECRET_NAME")

	return EnvironmentVariables{
		Env:          env,
		Region:       region,
		DBSecretName: dbSecretName,
	}
}

func mustGetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Sprintf("%s is not set", key))
	}
	return value
}

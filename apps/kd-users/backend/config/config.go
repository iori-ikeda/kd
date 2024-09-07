package config

import "os"

const (
	ENV_DEV  = "dev"
	ENV_PROD = "prod"
)

type Config struct {
	Env        string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

func NewConfig() Config {
	env := os.Getenv("ENV")
	if env == "" {
		panic("ENV is not set")
	}

	envVars := LoadEnvironmentVariables()

	return Config{
		Env:        env,
		DBHost:     envVars.DBHost,
		DBPort:     envVars.DBPort,
		DBUser:     envVars.DBUser,
		DBPassword: envVars.DBPassword,
		DBName:     envVars.DBName,
	}
}

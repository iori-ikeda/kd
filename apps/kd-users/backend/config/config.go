package config

import "os"

const (
	ENV_DEV  = "dev"
	ENV_PROD = "prod"
)

type Config struct {
	Env          string
	Region       string
	DBSecretName string
}

func NewConfig() Config {
	env := os.Getenv("ENV")
	if env == "" {
		panic("ENV is not set")
	}

	envVars := LoadEnvironmentVariables()

	return Config{
		Env:          env,
		Region:       envVars.Region,
		DBSecretName: envVars.DBSecretName,
	}
}

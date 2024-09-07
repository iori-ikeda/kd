package config

import "os"

type EnvironmentVariables struct {
	Env          string
	Region       string
	DBSecretName string
}

func LoadEnvironmentVariables() EnvironmentVariables {
	env := os.Getenv("ENV")
	if env == "" {
		panic("ENV is not set")
	}

	region := os.Getenv("REGION")
	dbSecretName := os.Getenv("DB_SECRET_NAME")

	return EnvironmentVariables{
		Env:          env,
		Region:       region,
		DBSecretName: dbSecretName,
	}
}

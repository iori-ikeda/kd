package config

import "os"

type EnvironmentVariables struct {
	Region       string
	DBSecretName string
}

func LoadEnvironmentVariables() EnvironmentVariables {
	region := os.Getenv("REGION")
	dbSecretName := os.Getenv("DB_SECRET_NAME")

	return EnvironmentVariables{
		Region:       region,
		DBSecretName: dbSecretName,
	}
}

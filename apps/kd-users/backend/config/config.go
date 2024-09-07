package config

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
	envVars := LoadEnvironmentVariables()

	// (S1016)go-staticcheck で警告が出る。 EnvironmentVariables と Config のフィールドが同じなので。
	// これらの構造体のフィールドが一致しなくなったらこっちの方針をとる
	// return Config{ // nolint:staticcheck
	// 	Env:          envVars.Env,
	// 	Region:       envVars.Region,
	// 	DBSecretName: envVars.DBSecretName,
	// }

	return Config(envVars)
}

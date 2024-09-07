package initializer

import (
	"kd-users/config"
	"kd-users/infra/common/rds"
)

type CommonInfras struct {
	RdsClient rds.RdsClient
}

func initCommonInfras(conf config.Config) CommonInfras {
	rdsClient := rds.NewRdsClient(conf)

	return CommonInfras{RdsClient: rdsClient}
}

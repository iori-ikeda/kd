package initializer

import "kd-users/infra/domain/userRepository"

type DomainInfras struct {
	UserRepository userRepository.IUserRepository
}

func initDomainInfras(commonInfras CommonInfras) DomainInfras {
	userRepository := userRepository.NewUserRepository(commonInfras.RdsClient.DBConn)

	return DomainInfras{
		UserRepository: userRepository,
	}
}

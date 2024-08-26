package initializer

type UseCases struct{}

func initUseCases(
	commonInfras CommonInfras,
	domainInfras DomainInfras,
	domainServices DomainServices,
) UseCases {
	return UseCases{}
}

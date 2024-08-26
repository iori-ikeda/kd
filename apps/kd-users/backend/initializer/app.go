package initializer

type App struct {
	CommonInfras
	DomainInfras
	DomainServices
	UseCases
	Scenarios
	Handlers
}

func InitApp() App {
	commonInfras := initCommonInfras()
	domainInfras := initDomainInfras(commonInfras)
	domainServices := initDomainServices(commonInfras, domainInfras)
	useCases := initUseCases(commonInfras, domainInfras, domainServices)
	scenarios := initScenarios(useCases)
	handlers := initHandlers(useCases, scenarios)

	return App{
		CommonInfras:   commonInfras,
		DomainInfras:   domainInfras,
		DomainServices: domainServices,
		UseCases:       useCases,
		Scenarios:      scenarios,
		Handlers:       handlers,
	}
}

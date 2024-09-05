package initializer

import "kd-users/application/useCase"

type UseCases struct {
	CreateUserUseCase useCase.ICreateUserUseCase
	GetUserUseCase    useCase.IGetUserUseCase
	ListUsersUseCase  useCase.IListUsersUseCase
	UpdateUserUseCase useCase.IUpdateUserUseCase
	DeleteUserUseCase useCase.IDeleteUserUseCase
}

func initUseCases(
	commonInfras CommonInfras,
	domainInfras DomainInfras,
	domainServices DomainServices,
) UseCases {
	createUserUseCase := useCase.NewCreateUserUseCase(domainInfras.UserRepository)
	getUserUseCase := useCase.NewGetUserUseCase(domainInfras.UserRepository)
	listUsersUseCase := useCase.NewListUsersUseCase(domainInfras.UserRepository)
	updateUserUseCase := useCase.NewUpdateUserUseCase(domainInfras.UserRepository)
	deleteUserUseCase := useCase.NewDeleteUserUseCase(domainInfras.UserRepository)

	return UseCases{
		CreateUserUseCase: createUserUseCase,
		GetUserUseCase:    getUserUseCase,
		ListUsersUseCase:  listUsersUseCase,
		UpdateUserUseCase: updateUserUseCase,
		DeleteUserUseCase: deleteUserUseCase,
	}
}

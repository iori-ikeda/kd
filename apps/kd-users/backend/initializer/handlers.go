package initializer

import (
	"kd-users/presentation/handler"
)

type Handlers struct {
	userHandler handler.UserHandler
}

func initHandlers(
	usecases UseCases,
	scenarios Scenarios,
) Handlers {
	userHandler := handler.NewUserHandler(
		usecases.CreateUserUseCase,
		usecases.ListUsersUseCase,
		usecases.UpdateUserUseCase,
		usecases.DeleteUserUseCase,
	)

	return Handlers{
		userHandler: userHandler,
	}
}

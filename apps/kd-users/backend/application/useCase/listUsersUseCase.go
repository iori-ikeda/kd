package useCase

import (
	userModel "kd-users/domain/model/user"
	"kd-users/infra/domain"
)

type IListUsersUseCase interface {
	Execute() (ListUsersOutput, error)
}

type ListUsersUseCase struct {
	userRepository domain.IUserRepository
}

type ListUsersOutput struct {
	Users userModel.Users
}

func NewListUsersUseCase(userRepository domain.IUserRepository) IListUsersUseCase {
	return ListUsersUseCase{userRepository: userRepository}
}

func (u ListUsersUseCase) Execute() (ListUsersOutput, error) {
	users, err := u.userRepository.FindAll()
	if err != nil {
		return ListUsersOutput{}, err
	}
	return ListUsersOutput{Users: users}, nil
}
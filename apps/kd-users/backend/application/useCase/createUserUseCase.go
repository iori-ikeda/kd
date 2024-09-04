package useCase

import (
	userModel "kd-users/domain/model/user"
	"kd-users/infra/domain"
)

type ICreateUserUseCase interface {
	Execute() (CreateUserOutput, error)
}

type CreateUserUseCase struct {
	userRepository domain.IUserRepository
}

type CreateUserOutput struct {
	ID string
}

func NewCreateUserUseCase(userRepository domain.IUserRepository) ICreateUserUseCase {
	return CreateUserUseCase{userRepository: userRepository}
}

func (u CreateUserUseCase) Execute() (CreateUserOutput, error) {
	user := userModel.New("test")
	err := u.userRepository.Save(user)
	if err != nil {
		return CreateUserOutput{}, err
	}
	return CreateUserOutput{ID: user.ID}, nil
}

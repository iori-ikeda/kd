package useCase

import (
	userModel "kd-users/domain/model/user"
	"kd-users/infra/domain/userRepository"
)

type ICreateUserUseCase interface {
	Execute(input CreateUserInput) (CreateUserOutput, error)
}

type CreateUserUseCase struct {
	userRepository userRepository.IUserRepository
}

type CreateUserInput struct {
	Name string `json:"name" validate:"required"`
}

type CreateUserOutput struct {
	ID string
}

func NewCreateUserUseCase(userRepository userRepository.IUserRepository) ICreateUserUseCase {
	return CreateUserUseCase{userRepository: userRepository}
}

func (u CreateUserUseCase) Execute(input CreateUserInput) (CreateUserOutput, error) {
	user := userModel.New("test", input.Name)
	err := u.userRepository.Save(user)
	if err != nil {
		return CreateUserOutput{}, err
	}
	return CreateUserOutput{ID: user.ID}, nil
}

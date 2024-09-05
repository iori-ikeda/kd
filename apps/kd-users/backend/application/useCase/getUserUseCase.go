package useCase

import (
	userModel "kd-users/domain/model/user"
	"kd-users/infra/domain/userRepository"
)

type IGetUserUseCase interface {
	Execute(input GetUserInput) (GetUserOutput, error)
}

type GetUserUseCase struct {
	userRepository userRepository.IUserRepository
}

type GetUserInput struct {
	ID string
}

type GetUserOutput struct {
	User userModel.User
}

func NewGetUserUseCase(userRepository userRepository.IUserRepository) IGetUserUseCase {
	return GetUserUseCase{userRepository: userRepository}
}

func (u GetUserUseCase) Execute(input GetUserInput) (GetUserOutput, error) {
	user, err := u.userRepository.FindByID(input.ID)
	if err != nil {
		return GetUserOutput{}, err
	}
	return GetUserOutput{User: user}, nil
}

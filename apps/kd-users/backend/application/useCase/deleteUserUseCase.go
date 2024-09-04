package useCase

import (
	"kd-users/infra/domain"
)

type IDeleteUserUseCase interface {
	Execute(input DeleteUserInput) error
}

type DeleteUserUseCase struct {
	userRepository domain.IUserRepository
}

type DeleteUserInput struct {
	ID string
}

func NewDeleteUserUseCase(userRepository domain.IUserRepository) IDeleteUserUseCase {
	return DeleteUserUseCase{userRepository: userRepository}
}

func (u DeleteUserUseCase) Execute(input DeleteUserInput) error {
	err := u.userRepository.Remove(input.ID)
	if err != nil {
		return err
	}
	return nil
}
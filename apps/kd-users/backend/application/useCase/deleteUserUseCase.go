package useCase

import (
	"kd-users/infra/domain/userRepository"
)

type IDeleteUserUseCase interface {
	Execute(input DeleteUserInput) error
}

type DeleteUserUseCase struct {
	userRepository userRepository.IUserRepository
}

type DeleteUserInput struct {
	ID string
}

func NewDeleteUserUseCase(userRepository userRepository.IUserRepository) IDeleteUserUseCase {
	return DeleteUserUseCase{userRepository: userRepository}
}

func (u DeleteUserUseCase) Execute(input DeleteUserInput) error {
	err := u.userRepository.Remove(input.ID)
	if err != nil {
		return err
	}
	return nil
}

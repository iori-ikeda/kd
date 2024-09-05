package useCase

import (
	"kd-users/infra/domain"
)

type IUpdateUserUseCase interface {
	Execute(input UpdateUserInput) (UpdateUserOutput, error)
}

type UpdateUserUseCase struct {
	userRepository domain.IUserRepository
}

type UpdateUserInput struct {
	ID string
}

type UpdateUserOutput struct {
	ID string
}

func NewUpdateUserUseCase(userRepository domain.IUserRepository) IUpdateUserUseCase {
	return UpdateUserUseCase{userRepository: userRepository}
}

func (u UpdateUserUseCase) Execute(input UpdateUserInput) (UpdateUserOutput, error) {
	user, err := u.userRepository.FindByID(input.ID)
	if err != nil {
		return UpdateUserOutput{}, err
	}
	return UpdateUserOutput{ID: user.ID}, nil
}
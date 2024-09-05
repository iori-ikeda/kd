package useCase

import "kd-users/infra/domain/userRepository"

type IUpdateUserUseCase interface {
	Execute(input UpdateUserInput) (UpdateUserOutput, error)
}

type UpdateUserUseCase struct {
	userRepository userRepository.IUserRepository
}

type UpdateUserInput struct {
	ID   string
	Name string
}

type UpdateUserOutput struct {
	ID string
}

func NewUpdateUserUseCase(userRepository userRepository.IUserRepository) IUpdateUserUseCase {
	return UpdateUserUseCase{userRepository: userRepository}
}

func (u UpdateUserUseCase) Execute(input UpdateUserInput) (UpdateUserOutput, error) {
	user, err := u.userRepository.FindByID(input.ID)
	if err != nil {
		return UpdateUserOutput{}, err
	}

	user.Update(input.Name)

	err = u.userRepository.Save(user)
	if err != nil {
		return UpdateUserOutput{}, err
	}

	return UpdateUserOutput{ID: user.ID}, nil
}

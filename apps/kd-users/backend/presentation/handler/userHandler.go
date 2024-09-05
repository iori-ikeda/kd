package handler

import (
	"kd-users/application/useCase"
	userModel "kd-users/domain/model/user"

	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	createUserUseCase useCase.ICreateUserUseCase
	listUserUseCase   useCase.IListUsersUseCase
	updateUserUseCase useCase.IUpdateUserUseCase
	deleteUserUseCase useCase.IDeleteUserUseCase
}

func NewUserHandler(createUserUseCase useCase.ICreateUserUseCase, listUserUseCase useCase.IListUsersUseCase, updateUserUseCase useCase.IUpdateUserUseCase, deleteUserUseCase useCase.IDeleteUserUseCase) UserHandler {
	return UserHandler{
		createUserUseCase: createUserUseCase,
		listUserUseCase:   listUserUseCase,
		updateUserUseCase: updateUserUseCase,
		deleteUserUseCase: deleteUserUseCase,
	}
}

type ListUsersResponse struct {
	Users userModel.Users `json:"userModel"`
}

func (h UserHandler) ListUsers(c echo.Context) error {
	output, err := h.listUserUseCase.Execute()
	if err != nil {
		return c.JSON(500, map[string]string{"error": err.Error()})
	}

	resp := ListUsersResponse{
		Users: output.Users,
	}

	return c.JSON(200, resp)

}

type CreateUserRequest struct {
	Name string `json:"name" validate:"required"`
}

type CreateUserResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h UserHandler) CreateUser(c echo.Context) error {
	var req CreateUserRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(400, map[string]string{"error": err.Error()})
	}

	input := useCase.CreateUserInput{
		Name: req.Name,
	}

	output, err := h.createUserUseCase.Execute(input)
	if err != nil {
		return c.JSON(400, map[string]string{"error": err.Error()})
	}

	resp := CreateUserResponse{
		ID:   output.ID,
		Name: req.Name,
	}

	return c.JSON(200, resp)
}

type UpdateUserRequest struct {
	Name string `json:"name" validate:"required"`
}

type UpdateUserResponse struct {
	ID string `json:"id"`
}

func (h UserHandler) UpdateUser(c echo.Context) error {
	var req UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(400, map[string]string{"error": err.Error()})
	}

	id := c.Param("id")
	input := useCase.UpdateUserInput{
		ID:   id,
		Name: req.Name,
	}

	output, err := h.updateUserUseCase.Execute(input)
	if err != nil {
		return c.JSON(400, map[string]string{"error": err.Error()})
	}

	resp := UpdateUserResponse{
		ID: output.ID,
	}

	return c.JSON(200, resp)
}

type DeleteUserResponse struct {
	ID string `json:"id"`
}

func (h UserHandler) DeleteUser(c echo.Context) error {
	id := c.Param("id")

	input := useCase.DeleteUserInput{
		ID: id,
	}

	err := h.deleteUserUseCase.Execute(input)
	if err != nil {
		return c.JSON(400, map[string]string{"error": err.Error()})
	}

	return c.NoContent(204)
}

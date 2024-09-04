package domain

import (
	userModel "kd-users/domain/model/user"

	"gorm.io/gorm"
)

type IUserRepository interface {
	Save(user userModel.User) error
	FindByID(id string) (userModel.User, error)
	FindAll() (userModel.Users, error)
	Remove(id string) error
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return UserRepository{db: db}
}

func (r UserRepository) Save(user userModel.User) error {
	return r.db.Save(&user).Error
}

func (r UserRepository) FindByID(id string) (userModel.User, error) {
	var user userModel.User
	err := r.db.First(&user, "id = ?", id).Error
	return user, err
}

func (r UserRepository) FindAll() (userModel.Users, error) {
	var users userModel.Users
	err := r.db.Find(&users).Error
	return users, err
}

func (r UserRepository) Remove(id string) error {
	return r.db.Delete(&userModel.User{}, "id = ?", id).Error
}

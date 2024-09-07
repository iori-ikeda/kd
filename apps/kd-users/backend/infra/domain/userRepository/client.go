package userRepository

import (
	userModel "kd-users/domain/model/user"
	"kd-users/infra/common/rds"
)

type IUserRepository interface {
	Save(user userModel.User) error
	FindByID(id string) (userModel.User, error)
	FindAll() (userModel.Users, error)
	Remove(id string) error
}

type UserRepository struct {
	dbConn rds.DBConn
}

func NewUserRepository(dbConn rds.DBConn) UserRepository {
	return UserRepository{dbConn: dbConn}
}

func (r UserRepository) Save(user userModel.User) error {
	return r.dbConn.Conn.Save(&user).Error
}

func (r UserRepository) FindByID(id string) (userModel.User, error) {
	var user userModel.User
	err := r.dbConn.Conn.First(&user, "id = ?", id).Error
	return user, err
}

func (r UserRepository) FindAll() (userModel.Users, error) {
	var users userModel.Users
	err := r.dbConn.Conn.Find(&users).Error
	return users, err
}

func (r UserRepository) Remove(id string) error {
	return r.dbConn.Conn.Delete(&userModel.User{}, "id = ?", id).Error
}

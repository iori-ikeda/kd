package users

type User struct {
	ID string
}

type Users []User

func New(id string) User {
	return User{ID: id}
}
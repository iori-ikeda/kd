package users

type User struct {
	ID string
	Name string
}

type Users []User

func New(id, name string) User {
	return User{ID: id, Name: name}
}

func Reconstruct(id, name string) User {
	return User{ID: id, Name: name}
}
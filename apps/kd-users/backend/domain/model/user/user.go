package user

type User struct {
	ID   string
	Name string
}

type Users []User

func New(id, name string) User {
	return User{ID: id, Name: name}
}

func Reconstruct(id, name string) User {
	return User{ID: id, Name: name}
}

func (u *User) Update(name string) {
	u.Name = name
}

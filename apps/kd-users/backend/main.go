package main

import "kd-users/initializer"

func main() {
	app := initializer.InitApp()
	initializer.InitServer(app)

}

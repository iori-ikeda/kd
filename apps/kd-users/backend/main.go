package main

import (
	"kd-users/config"
	"kd-users/initializer"
)

func main() {
	config := config.NewConfig()
	app := initializer.InitApp(config)
	initializer.InitServer(app)
}

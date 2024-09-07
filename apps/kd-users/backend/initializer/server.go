package initializer

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

func InitServer(app App) {
	handlers := app.Handlers

	e := echo.New()

	e.Logger.SetLevel(log.INFO)
	// e.HTTPErrorHandler =

	recoverConfig := middleware.DefaultRecoverConfig
	recoverConfig.LogLevel = log.ERROR
	e.Use(middleware.RecoverWithConfig(recoverConfig))

	e.Use(middleware.CORS())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 1,
	}))
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "{\"remote_ip\":\"${remote_ip}\",\"method\":\"${method}\",\"uri\":\"${uri}\",\"status\":\"${status}\",\"latency\":\"${latency_human}\"}\n",
	}))

	e.GET("/health_check", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"result": "ok"})
	})

	userGroup := e.Group("/users")
	userGroup.GET("/:id", handlers.userHandler.GetUser)
	userGroup.GET("/", handlers.userHandler.ListUsers)
	userGroup.POST("/", handlers.userHandler.CreateUser)
	userGroup.PUT("/:id", handlers.userHandler.UpdateUser)
	userGroup.DELETE("/:id", handlers.userHandler.DeleteUser)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", "8080")))
}

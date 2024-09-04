package initializer

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

func InitServer(app App) {
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

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", "8080")))
}

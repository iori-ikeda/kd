package initializer

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"net/http"
)

func InitServer(app App) {
	e := echo.New()

	e.GET("/health_check", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"result": "ok"})
	})

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", "8080")))
}

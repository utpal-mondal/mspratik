package cmd

import (
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "wms",
	Short: "Warehouse Management System Backend",
	Long:  `A high-performance backend for Warehouse Management System built with GoFiber and PostgreSQL`,
}

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.AddCommand(serveCmd)
}

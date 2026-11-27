package handlers

import (
	"errors"
	"fmt"
	"log"
	"math"
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type tripRequest struct {
	GRChallanNo               string   `json:"gr_challan_no"`
	Date                      string   `json:"date"`
	InvoiceNo                 string   `json:"invoice_no"`
	BillingWeighmentClient    string   `json:"billing_weighment_client"`
	BillingWeighmentBroker    string   `json:"billing_weighment_broker"`
	WeightPort                *float64 `json:"weight_port"`
	WeightGRN                 *float64 `json:"weight_grn"`
	WeightOther               *float64 `json:"weight_other"`
	ProductID                 uint     `json:"product_id"`
	LoadingPointID            uint     `json:"loading_point_id"`
	UnloadingPointID          uint     `json:"unloading_point_id"`
	ProductConditionOnLoading string   `json:"product_condition_on_loading"`
	VessalID                  *uint    `json:"vessal_id"`
	FirmID                    uint     `json:"firm_id"`
	VehicleID                 *uint    `json:"vehicle_id"`
	VehicleNameFallback       string   `json:"vehicle_name_fallback"`
	Wheel                     *int     `json:"wheel"`
	VehicleType               string   `json:"vehicle_type"`
	BrokerID                  uint     `json:"broker_id"`
	UpperLimitCondition       string   `json:"upper_limit_condition"`
	BrokerPaymentType         string   `json:"broker_payment_type"`
	BrokerPrice               *float64 `json:"broker_price"`
	FuelQty                   *float64 `json:"fuel_qty"`
	FuelPrice                 *float64 `json:"fuel_price"`
	FuelAdvance               *float64 `json:"fuel_advance"`
	PumpID                    *uint    `json:"pump_id"`
	CashAdvance               *float64 `json:"cash_advance"`
	AdvanceFromClient         *float64 `json:"advance_from_client"`
	TransportingCharges       *float64 `json:"transporting_charges"`
	TotalAdvance              *float64 `json:"total_advance"`
	ClientID                  uint     `json:"client_id"`
	ClientPrice               *float64 `json:"client_price"`
	ClientPaymentType         string   `json:"client_payment_type"`
	ClientAdvance             *float64 `json:"client_advance"`
	ConsignorID               uint     `json:"consignor_id"`
	Session                   string   `json:"session"`
}

type tripLookupOption struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type tripVehicleOption struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	NumberOfWheels *int   `json:"number_of_wheels"`
}

func validateTripRequest(req *tripRequest) (time.Time, map[string]string) {
	fieldErrors := make(map[string]string)
	req.GRChallanNo = strings.TrimSpace(req.GRChallanNo)
	req.InvoiceNo = strings.TrimSpace(req.InvoiceNo)
	req.ProductConditionOnLoading = strings.TrimSpace(req.ProductConditionOnLoading)
	req.BillingWeighmentClient = strings.TrimSpace(req.BillingWeighmentClient)
	req.BillingWeighmentBroker = strings.TrimSpace(req.BillingWeighmentBroker)
	req.VehicleType = strings.TrimSpace(req.VehicleType)
	req.VehicleNameFallback = strings.TrimSpace(req.VehicleNameFallback)
	req.BrokerPaymentType = strings.TrimSpace(req.BrokerPaymentType)
	req.ClientPaymentType = strings.TrimSpace(req.ClientPaymentType)
	req.Session = strings.TrimSpace(req.Session)
	if req.VehicleID != nil && *req.VehicleID == 0 {
		req.VehicleID = nil
	}

	if req.GRChallanNo == "" {
		fieldErrors["gr_challan_no"] = "GR/Challan No is required"
	}
	if req.InvoiceNo == "" {
		fieldErrors["invoice_no"] = "Invoice No is required"
	}
	tripDate, err := time.Parse("2006-01-02", strings.TrimSpace(req.Date))
	if err != nil {
		fieldErrors["date"] = "A valid date is required"
	}
	for field, id := range map[string]uint{
		"product_id":         req.ProductID,
		"loading_point_id":   req.LoadingPointID,
		"unloading_point_id": req.UnloadingPointID,
		"firm_id":            req.FirmID,
		"broker_id":          req.BrokerID,
		"client_id":          req.ClientID,
		"consignor_id":       req.ConsignorID,
	} {
		if id == 0 {
			fieldErrors[field] = strings.ReplaceAll(strings.TrimSuffix(field, "_id"), "_", " ") + " is required"
		}
	}
	if (req.VehicleID == nil || *req.VehicleID == 0) && req.VehicleNameFallback == "" {
		fieldErrors["vehicle_name_fallback"] = "Select an RC No or enter an RC name"
	}
	if req.VehicleID != nil && req.VehicleNameFallback != "" {
		fieldErrors["vehicle_name_fallback"] = "Use either a database RC No or a manual RC name"
	}
	if !oneOf(req.ProductConditionOnLoading, "Normal", "Heavy Moisture", "Sweeping", "Water Drop") {
		fieldErrors["product_condition_on_loading"] = "Select a valid product condition"
	}
	if req.BillingWeighmentClient != "" && !oneOf(req.BillingWeighmentClient, "PORT", "GREEN", "Other") {
		fieldErrors["billing_weighment_client"] = "Select a valid client billing weighment"
	}
	if req.BillingWeighmentBroker != "" && !oneOf(req.BillingWeighmentBroker, "PORT", "GREEN", "Other") {
		fieldErrors["billing_weighment_broker"] = "Select a valid broker billing weighment"
	}
	if req.BrokerPaymentType != "" && !oneOf(req.BrokerPaymentType, "Normal", "Under Loading", "Fixed") {
		fieldErrors["broker_payment_type"] = "Select a valid broker payment type"
	}
	if req.ClientPaymentType != "" && !oneOf(req.ClientPaymentType, "Normal", "Fixed") {
		fieldErrors["client_payment_type"] = "Select a valid client payment type"
	}
	if req.VehicleType != "" && !oneOf(req.VehicleType, "Truck", "Dumper") {
		fieldErrors["vehicle_type"] = "Select a valid vehicle type"
	}
	if req.Session != "" && !oneOf(req.Session, tripSessions(time.Now())...) {
		fieldErrors["session"] = "Select a valid session"
	}
	if req.Wheel != nil && *req.Wheel < 0 {
		fieldErrors["wheel"] = "Wheel count cannot be negative"
	}
	for field, value := range map[string]*float64{
		"weight_port":          req.WeightPort,
		"weight_grn":           req.WeightGRN,
		"weight_other":         req.WeightOther,
		"broker_price":         req.BrokerPrice,
		"fuel_qty":             req.FuelQty,
		"fuel_price":           req.FuelPrice,
		"fuel_advance":         req.FuelAdvance,
		"cash_advance":         req.CashAdvance,
		"advance_from_client":  req.AdvanceFromClient,
		"transporting_charges": req.TransportingCharges,
		"total_advance":        req.TotalAdvance,
		"client_price":         req.ClientPrice,
		"client_advance":       req.ClientAdvance,
	} {
		if value != nil && (math.IsNaN(*value) || math.IsInf(*value, 0) || *value < 0) {
			fieldErrors[field] = "Value must be a non-negative number"
		}
	}
	return tripDate, fieldErrors
}

func oneOf(value string, choices ...string) bool {
	for _, choice := range choices {
		if value == choice {
			return true
		}
	}
	return false
}

func sessionForDate(date time.Time) string {
	startYear := sessionStartYear(date)
	return fmt.Sprintf("%d-%02d", startYear, (startYear+1)%100)
}

const firstTripSessionYear = 2020

// tripSessions returns financial-year sessions (April-March) from 2020-21 up to the current one, newest first.
func tripSessions(now time.Time) []string {
	current := sessionStartYear(now)
	sessions := make([]string, 0, current-firstTripSessionYear+1)
	for year := current; year >= firstTripSessionYear; year-- {
		sessions = append(sessions, fmt.Sprintf("%d-%02d", year, (year+1)%100))
	}
	return sessions
}

func sessionStartYear(date time.Time) int {
	if date.Month() < time.April {
		return date.Year() - 1
	}
	return date.Year()
}

func GetTripLookups(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}
	companyScoped := func(query *gorm.DB) *gorm.DB {
		if authUser.CompanyID != nil {
			return query.Where("company_id = ?", *authUser.CompanyID)
		}
		return query
	}

	lookups := fiber.Map{}
	products := make([]tripLookupOption, 0)
	if err := companyScoped(db.Model(&models.Product{})).Select("id, name").Order("name ASC").Find(&products).Error; err != nil {
		return tripLookupError(c, "products", err)
	}
	lookups["products"] = products

	loadingPoints := make([]tripLookupOption, 0)
	if err := db.Model(&models.LoadingPoint{}).Select("id, name").Order("name ASC").Find(&loadingPoints).Error; err != nil {
		return tripLookupError(c, "loading points", err)
	}
	lookups["loading_points"] = loadingPoints

	unloadingPoints := make([]tripLookupOption, 0)
	if err := db.Model(&models.UnloadingPoint{}).Select("id, name").Order("name ASC").Find(&unloadingPoints).Error; err != nil {
		return tripLookupError(c, "unloading points", err)
	}
	lookups["unloading_points"] = unloadingPoints

	var vehicles []models.Vehicle
	if err := companyScoped(db.Model(&models.Vehicle{})).
		Select("id, vehicle_number, number_of_wheels").
		Order("vehicle_number ASC").Find(&vehicles).Error; err != nil {
		return tripLookupError(c, "vehicles", err)
	}
	vehicleOptions := make([]tripVehicleOption, 0, len(vehicles))
	for _, vehicle := range vehicles {
		vehicleOptions = append(vehicleOptions, tripVehicleOption{
			ID: vehicle.ID, Name: vehicle.VehicleNumber, NumberOfWheels: vehicle.NumberOfWheels,
		})
	}
	lookups["vehicles"] = vehicleOptions

	brokers := make([]tripLookupOption, 0)
	if err := companyScoped(db.Model(&models.Broker{})).
		Select("id, broker_name AS name").Order("broker_name ASC").Find(&brokers).Error; err != nil {
		return tripLookupError(c, "brokers", err)
	}
	lookups["brokers"] = brokers

	clients := make([]tripLookupOption, 0)
	if err := companyScoped(db.Model(&models.Client{})).
		Select("id, client_name AS name").Order("client_name ASC").Find(&clients).Error; err != nil {
		return tripLookupError(c, "clients", err)
	}
	lookups["clients"] = clients

	consignors := make([]tripLookupOption, 0)
	if err := db.Model(&models.Consignor{}).Select("id, name").Order("name ASC").Find(&consignors).Error; err != nil {
		return tripLookupError(c, "consignors", err)
	}
	lookups["consignors"] = consignors

	firms := make([]tripLookupOption, 0)
	if err := db.Model(&models.Firm{}).Select("id, name").Order("name ASC").Find(&firms).Error; err != nil {
		return tripLookupError(c, "firms", err)
	}
	lookups["firms"] = firms

	vessals := make([]tripLookupOption, 0)
	if err := companyScoped(db.Model(&models.Vessal{})).Select("id, name").Order("name ASC").Find(&vessals).Error; err != nil {
		return tripLookupError(c, "vessals", err)
	}
	lookups["vessals"] = vessals

	pumps := make([]tripLookupOption, 0)
	if err := companyScoped(db.Model(&models.Pump{})).
		Select("id, pump_name AS name").Order("pump_name ASC").Find(&pumps).Error; err != nil {
		return tripLookupError(c, "pumps", err)
	}
	lookups["pumps"] = pumps

	now := time.Now()
	lookups["sessions"] = tripSessions(now)
	lookups["current_session"] = sessionForDate(now)

	return c.JSON(fiber.Map{"status": "success", "data": lookups})
}

func tripLookupError(c *fiber.Ctx, label string, err error) error {
	log.Printf("Failed to fetch trip %s: %v", label, err)
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		"status": "fail", "message": "Failed to fetch loading entry options",
	})
}

func CreateTrip(c *fiber.Ctx, db *gorm.DB) error {
	folioID, err := strconv.ParseUint(c.Params("folioId"), 10, 64)
	if err != nil || folioID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid folio id"})
	}
	var folio models.Folio
	if err := db.First(&folio, folioID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Folio not found"})
		}
		log.Printf("Failed to validate folio %d for trip: %v", folioID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to load folio"})
	}

	var req tripRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}
	tripDate, fieldErrors := validateTripRequest(&req)
	if len(fieldErrors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": fieldErrors})
	}
	if err := validateTripReferences(c, db, &req); err != nil {
		return err
	}

	session := req.Session
	if session == "" {
		session = sessionForDate(tripDate)
	}
	trip := models.Trip{
		FolioID: folio.ID, GRChallanNo: req.GRChallanNo, Date: tripDate, InvoiceNo: req.InvoiceNo,
		BillingWeighmentClient: req.BillingWeighmentClient, BillingWeighmentBroker: req.BillingWeighmentBroker,
		WeightPort: req.WeightPort, WeightGRN: req.WeightGRN, WeightOther: req.WeightOther,
		ProductID: req.ProductID, LoadingPointID: req.LoadingPointID, UnloadingPointID: req.UnloadingPointID,
		ProductConditionOnLoading: req.ProductConditionOnLoading, VessalID: req.VessalID, FirmID: req.FirmID,
		Session: session, VehicleID: req.VehicleID,
		VehicleNameFallback: req.VehicleNameFallback, Wheel: req.Wheel, VehicleType: req.VehicleType,
		BrokerID: req.BrokerID, UpperLimitCondition: strings.TrimSpace(req.UpperLimitCondition),
		BrokerPaymentType: req.BrokerPaymentType, BrokerPrice: req.BrokerPrice, FuelQty: req.FuelQty,
		FuelPrice: req.FuelPrice, FuelAdvance: req.FuelAdvance, PumpID: req.PumpID,
		CashAdvance: req.CashAdvance, AdvanceFromClient: req.AdvanceFromClient,
		TransportingCharges: req.TransportingCharges, TotalAdvance: req.TotalAdvance,
		ClientID: req.ClientID, ClientPrice: req.ClientPrice, ClientPaymentType: req.ClientPaymentType,
		ClientAdvance: req.ClientAdvance, ConsignorID: req.ConsignorID,
	}
	if err := db.Create(&trip).Error; err != nil {
		log.Printf("Failed to create trip for folio %d: %v", folio.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to save loading entry",
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   fiber.Map{"id": trip.ID, "folio_id": trip.FolioID, "session": trip.Session},
	})
}

func validateTripReferences(c *fiber.Ctx, db *gorm.DB, req *tripRequest) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}
	type reference struct {
		field         string
		id            uint
		model         interface{}
		companyScoped bool
	}
	references := []reference{
		{"product_id", req.ProductID, &models.Product{}, true},
		{"loading_point_id", req.LoadingPointID, &models.LoadingPoint{}, false},
		{"unloading_point_id", req.UnloadingPointID, &models.UnloadingPoint{}, false},
		{"firm_id", req.FirmID, &models.Firm{}, false},
		{"broker_id", req.BrokerID, &models.Broker{}, true},
		{"client_id", req.ClientID, &models.Client{}, true},
		{"consignor_id", req.ConsignorID, &models.Consignor{}, false},
	}
	if req.VehicleID != nil && *req.VehicleID > 0 {
		references = append(references, reference{"vehicle_id", *req.VehicleID, &models.Vehicle{}, true})
	}
	if req.VessalID != nil && *req.VessalID > 0 {
		references = append(references, reference{"vessal_id", *req.VessalID, &models.Vessal{}, true})
	}
	if req.PumpID != nil && *req.PumpID > 0 {
		references = append(references, reference{"pump_id", *req.PumpID, &models.Pump{}, true})
	}
	for _, ref := range references {
		query := db.Model(ref.model).Where("id = ?", ref.id)
		if ref.companyScoped && authUser.CompanyID != nil {
			query = query.Where("company_id = ?", *authUser.CompanyID)
		}
		var count int64
		if err := query.Count(&count).Error; err != nil {
			log.Printf("Failed to validate trip %s %d: %v", ref.field, ref.id, err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "fail", "message": "Failed to validate loading entry selections",
			})
		}
		if count == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "fail", "errors": fiber.Map{ref.field: "Selected option was not found"},
			})
		}
	}
	return nil
}

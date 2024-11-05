package models

type Region struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `json:"name"`
	Locations []Location `json:"locations"`
}

type Location struct {
	ID       uint   `gorm:"primary_key" json:"id"`
	Name     string `json:"name"`
	Region   Region `json:"region"`
	RegionID uint   `json:"region_id"`
}

##################################################################
##                        Boundary Files                        ##
##################################################################

# Publisher: Greater London Authority / London Datastore
# URL: https://data.london.gov.uk/dataset/statistical-gis-boundary-files-london

# Output files
# - lsoa.geojson
# - msoa.geojson

#------------ Load Libraries -------------#

library(sf)
library(dplyr)

#------------ Download Folder ------------#

url <- "https://data.london.gov.uk/download/statistical-gis-boundary-files-london/9ba8c833-6370-4b11-abdc-314aa020d5e0/statistical-gis-boundaries-london.zip"
download.file(url, destfile="temp_data.zip")
unzip("temp.zip", exdir = "temp_data")

#------------- Read In Data Filter for Westminster --------------#

oa <- read_sf("temp_data/statistical-gis-boundaries-london/ESRI/OA_2011_London_gen_MHW.shp") %>%
  dplyr::filter(LAD11NM == "Westminster")

lsoa <- read_sf("temp_data/statistical-gis-boundaries-london/ESRI/LSOA_2011_London_gen_MHW.shp") %>%
  dplyr::filter(LAD11NM == "Westminster")

msoa <- read_sf("temp_data/statistical-gis-boundaries-london/ESRI/MSOA_2011_London_gen_MHW.shp") %>%
  dplyr::filter(LAD11NM == "Westminster")

wards <- read_sf("temp_data/statistical-gis-boundaries-london/ESRI/London_Ward_CityMerged.shp") %>%
  dplyr::filter(BOROUGH == "Westminster")

westminster <- read_sf("temp_data/statistical-gis-boundaries-london/ESRI/London_Borough_Excluding_MHW.shp") %>%
  dplyr::filter(NAME =="Westminster")


#------------ Save filtered Data  ------------#

oa %>% st_write("oa_westminster.geojson", delete_dsn=T)
lsoa %>% st_write("lsoa_westminster.geojson", delete_dsn=T)
msoa %>% st_write("msoa_westminster.geojson", delete_dsn=T)
wards %>% st_write("wards_westminster.geojson", delete_dsn=T)
westminster %>% st_write("boundary_westminster.geojson", delete_dsn=T)

#------------ Remove downloaded data ------------#

unlink("temp_data", recursive = T)
unlink("temp_data.zip")




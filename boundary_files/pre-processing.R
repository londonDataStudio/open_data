##################################################################
##                        Boundary Files                        ##
##################################################################

# Publisher: Greater London Authority / London Datastore
# URL: https://data.london.gov.uk/dataset/statistical-gis-boundary-files-london

# Output files
# - oa_westminster.geojson
# - lsoa_westminster.geojson
# - msoa_westminster.geojson
# - wards_westminster.geojson
# - boundary_westminster.geojson

#------------ Load Libraries -------------#

library(sf)
library(dplyr)

#------------ Download Folder ------------#

url <- "https://data.london.gov.uk/download/statistical-gis-boundary-files-london/9ba8c833-6370-4b11-abdc-314aa020d5e0/statistical-gis-boundaries-london.zip"
download.file(url, destfile="temp_data.zip")
unzip("temp_data.zip", exdir = "temp_data")

#------------- Read In Data Filter for Westminster --------------#

path <- file.path("temp_data", "statistical-gis-boundaries-london", "ESRI")

oa <- read_sf(file.path(path,"OA_2011_London_gen_MHW.shp")) %>%
  dplyr::filter(LAD11NM == "Westminster") %>%
  st_transform(4326)

lsoa <- read_sf(file.path(path,"LSOA_2011_London_gen_MHW.shp")) %>%
  dplyr::filter(LAD11NM == "Westminster") %>%
  st_transform(4326)

msoa <- read_sf(file.path(path,"MSOA_2011_London_gen_MHW.shp")) %>%
  dplyr::filter(LAD11NM == "Westminster") %>%
  st_transform(4326)

wards <- read_sf(file.path(path,"London_Ward_CityMerged.shp")) %>%
  dplyr::filter(BOROUGH == "Westminster") %>%
  st_transform(4326)

westminster <- read_sf(file.path(path,"London_Borough_Excluding_MHW.shp")) %>%
  dplyr::filter(NAME =="Westminster") %>%
  st_transform(4326)

london_boroughs <- read_sf(file.path(path,"London_Borough_Excluding_MHW.shp")) %>%
  st_transform(4326)
  


#------------ Save filtered Data  ------------#

oa %>% st_write("oa_westminster.geojson", delete_dsn=T)
lsoa %>% st_write("lsoa_westminster.geojson", delete_dsn=T)
msoa %>% st_write("msoa_westminster.geojson", delete_dsn=T)
wards %>% st_write("wards_westminster.geojson", delete_dsn=T)
westminster %>% st_write("boundary_westminster.geojson", delete_dsn=T)
london_boroughs %>% st_write("boroughs_london.geojson", delete_dsn=T)

#------------ Remove downloaded data ------------#

unlink("temp_data", recursive = T)
unlink("temp_data.zip")




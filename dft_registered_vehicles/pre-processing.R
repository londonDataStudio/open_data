##################################################################
##             DfT Registered and Licensed Vehicles             ##
##################################################################

# Publisher: Department of Transport
# URL: https://www.gov.uk/government/statistical-data-sets/all-vehicles-veh01

# Output files
# - ultra_low_emission.csv

#------------ Load Libraries -------------

library(sf)
library(dplyr)
library(tidyr)
library(stringr)
library(readODS)
library(janitor)
library(ggplot2)
library(lubridate)
library(r2d3)
library(purrr)

london_codes <- read_sf("https://raw.githubusercontent.com/westminsterDataStudio/open_data/main/boundary_files/boroughs_london.geojson") %>%
  pull(GSS_CODE)

#------------ Download Data --------------

url <- "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1001622/veh0132.ods"
download.file(url, destfile = "veh0132.ods")

#------------- London Data ---------------

sheets <- c("all_ulev", "all_bev", "all_phev", 
            "private_ulev", "private_bev", "private_phev", 
            "company_ulev", "company_bev", "company_phev")

ulev_data <- list()

for (i in 1:length(sheets)){
  
  message(paste("Processing sheet", i, ":", sheets[i]))
  
  ulev <- read_ods("veh0132.ods", sheet = i, skip=6, col_types = NA) %>%
    as_tibble() %>%
    clean_names()
  
  ulev <- ulev %>% 
    dplyr::filter(ons_la_code_apr_2019 %in% london_codes) %>%
    pivot_longer(x2021_q1:x2011_q4, names_to="quarter", values_to="count") %>%
    rename("borough" = "region_local_authority_apr_2019_3") %>%
    mutate(count = str_replace(count, "c", "0")) %>%
    mutate(quarter=yq(str_replace(quarter, "x", "")), count=as.numeric(count)) %>%
    dplyr::filter(!is.na(count)) %>%
    arrange(quarter, borough) 
  
  ulev_data[[sheets[i]]] <- ulev
  
}

#------------- Save Data ----------------

ulev_data %>% 
  names(.) %>%
  map(~write_csv(ulev_data[[.]], paste0("data/", ., ".csv")))

file.remove("veh0132.ods")

#------------- Graphs -------------------

json_data <- jsonlite::toJSON(ulev_data)

r2d3(json_data,
     script="ulev_line_graph.js",
     d3_version="6",
     sizing = htmlwidgets::sizingPolicy(
       browser.padding = 20,
       browser.fill=T
     ) )


#---------- GGPLOT Geaphs--------------


ulev %>%
  ggplot(aes(x=quarter, y=count, group=borough, color= borough=="Westminster")) +
  geom_line(alpha=0.6) +
  theme_bw() +
  labs(title="Licensed Ultra Low Emmision Vehicles", 
       subtitle = "Based on data from the Department of Transport",
       x="Date",
       y="Ultra Low Emission Vehicles") +
  scale_color_manual(values=c("lightgrey", "darkblue"), labels=c("Other London Boroughs", "Westminster")) +
  theme(legend.position = "bottom", 
        legend.title = element_blank()) 

ggsave(file = "ultra_low_emission_vehicles_london.png", width=9, height=7, units="in", dpi=600)



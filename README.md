# exact-fit

    "test": "echo \"Error: no test specified\" && exit 1",

// in home screen will add wild search i,e service,subservice, subscriptionplan (name,price) etc.

// after user taking subscription they can not change their address
booking table:
id,
user_id,
fullname,
email,
mobile,
type,
address_id,
service_id,
sub_service_id,
scope_of_work(text),
full_fit_out(text design + execution),
work_type(renovation/refabrication),
specific_work_type(string),
existing_drawing/plans(boolean),
plan_images(json)-> to store multiple images,
estimated_budget_range(string),
description(text),

#########################################

Service model

type.enum(subscription,enquiry) #

Sub-Service

price(optional) #

PropertyType

remove category(not required) #

commercial_price, residential_price(float/decimal).optional #

<<<<<<< HEAD
ticket: technician_id(uuid),snapshot(json),note(text)
=======
CREATE TABLE property_type_plans (
id CHAR(36) PRIMARY KEY,
property_type_id CHAR(36) NOT NULL,
subscription_plan_id CHAR(36) NOT NULL,
commercial_price DECIMAL(10,2) NULL,
residential_price DECIMAL(10,2) NULL,
createdAt DATETIME NOT NULL,
updatedAt DATETIME NOT NULL,
deletedAt DATETIME NULL,
)

> > > > > > > bb55975c37f9a2b96e9b4a300e520f3933899a58

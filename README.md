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

30-12-2025

Admin Panel

Currently, the Admin Panel uses role-based login.
If a Super Admin wants to create an Admin, they must assign a role and permissions.
In the permissions table, the user_id is stored, which can belong to either an Admin or a User. Permissions are fetched based on this user_id.

Website

As of now, subscription plans are being submitted, but payment integration is not implemented yet.
For Custom Plans, the API integration for fetching plan details is completed, but submission is not implemented.
The Emergency feature supports submission, but the Notification API is not integrated due to missing credentials.
The Enquiry form submission is working successfully.
Sub-service details need to be dynamic.
Currently, the images and text are static, except for the action buttons, which are used only for redirection to the Packages page or the Enquiry form.

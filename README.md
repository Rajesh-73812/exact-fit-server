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

In the admin panel, the emergency edit and view backend has not been completed; only the frontend is done. When a customer raises a request for an emergency service, the admin can see the customer’s request. If no technician is assigned, the admin can assign one. After the technician is assigned, the technician will send the problem details. After reviewing those details, the admin can raise a quotation and send it to the customer in PDF format. This quotation will be reflected in the customer app and website under the Bookings → Emergency section, where the customer can download it. Once the customer accepts the quotation, it should proceed to the payment process.

For this flow, the entire frontend is completed, but the backend is not done yet.

Website

As of now, subscription plans are being submitted, but payment integration is not implemented yet.
For Custom Plans, the API integration for fetching plan details is completed, but submission is not implemented.
The Emergency feature supports submission, but the Notification API is not integrated due to missing credentials.
The Enquiry form submission is working successfully.
Sub-service details need to be dynamic.
Currently, the images and text are static, except for the action buttons, which are used only for redirection to the Packages page or the Enquiry form.

Emergency service button:
For now, when I select a plan, the selected plan is stored in local storage. After payment integration, this needs to be removed, as it was added statically due to the missing payment integration.

I implemented a few validations, but all form validations still need to be checked. Also, the success popup message needs to be changed. I had implemented it earlier, but during the update process it got changed, so it needs to be corrected again.
{showPopup && (

<!-- <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={handleClosePopup}
        >
          <div
            className="bg-white rounded-xl p-10 shadow-lg text-center max-w-md mx-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
          >
            {isError ? (
              // Error: Red X SVG (same as existing)
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6L18 18"
                    stroke="#F04438"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="#F04438"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              // Success: CheckIcon
              <Image
                src={CheckIcon}
                alt="check"
                className="w-10 h-10 mx-auto mb-4"
              />
            )}
            <p className="text-lg font-medium">{popupMessage}</p>
            <button
              onClick={handleClosePopup}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )} -->

      this is the success pop every form

In the profile section, the dashboard is static for now. The payment section and notification section are also static due to the payment API not being completed. These items are pending.

In the address section, after completing the payment, only that address should be locked. This process has not been implemented yet and needs to be done after the payment integration.

# What this Workflow Does:

## create-branch-from-issue.yml:

-> When an issue is opened, it automatically creates a new branch named after the issue number and title (with appropriate transformations).

-> This new branch is created based on the default branch and pushed to the remote repository.

## .husky

# Install Husky for Git hooks

npm install husky --save-dev

# Install ESLint and Prettier

npm install eslint prettier eslint-plugin-prettier eslint-config-prettier --save-dev

# Enable husky

npx husky install

# Optionally, install lint-staged (to only run ESLint and Prettier on staged files)

npm install lint-staged --save-dev

# required for boundary check

npm install eslint-plugin-boundaries --save-dev

## .husky/pre-commit:

    What it does: This hook runs before a commit is made in Git.

    Purpose: It is used to check or fix the code before it's committed to the local repository.

    Common Uses:

    Linting (e.g., running ESLint to check for code style issues).

    Formatting (e.g., running Prettier to ensure code is formatted correctly).

    Running tests to ensure no errors before committing.

## .husky/pre-push:

    What it does: This hook runs before pushing your commits to a remote Git repository.

    Purpose: It ensures that the code is checked or validated before it is shared with others on the remote repository.

    Common Uses:

    Running tests to verify that everything is working correctly.

    Ensuring the commit message follows a specific format.

    Running linting or formatting checks before pushing code to a remote repository.

<!---------------------------------------- ADMIN ---------------------------------------------------->

# 1.1) api/admin/auth/V1/register: [POST]

| Step | Action                                                                          |
| ---- | ------------------------------------------------------------------------------- |
| 🔢 1 | Admin enters their email and password                                           |
| 🔐 2 | Input is validated using `loginValidator` (email, password)                     |
| 🧐 3 | Backend checks if the admin already exists in the database                      |
| 🔒 4 | If the admin exists, return a conflict response (409)                           |
| 🧑‍💻 5 | If the admin does not exist, hash the password using bcrypt                     |
| 📝 6 | New admin is created in the database with hashed password                       |
| ✅ 7 | Admin is successfully registered, and a success response with email is returned |

# 1.2) api/admin/auth/V1/login: [POST]

| Step | Action                                                                |
| ---- | --------------------------------------------------------------------- |
| 🔢 1 | Admin enters their email and password                                 |
| 🔐 2 | Input is validated using `loginValidator` (email, password)           |
| 🧐 3 | Backend checks if the admin exists in the database                    |
| 🔑 4 | If admin doesn't exist, return an error response (404)                |
| 🔒 5 | Compare the entered password with the hashed password using bcrypt    |
| 🪪 6 | If passwords match, generate a JWT token for the session              |
| ✅ 7 | Login is successful, and the JWT token is returned for authentication |

//mobile flow

======================

1. User enters +971XXXXXXXXX
2. Click "Send OTP" → call /api/auth/request-otp
3. Show 6-digit input + resend timer (60 sec)
4. User enters OTP → call /api/auth/verify-otp
5. On success → save token, go to home

# DEVELOPER KNOW:

WHAT SEQUELIZE ACTUALLY DOES (AND WHICH JOIN IT USES):

Condition, || JOIN Type Used || Why?
========================================================================================  
where inside include + LEFT JOIN Keeps all main records

---

required: false (default),
where inside include + required: true, INNER JOIN, Only returns main records

---

# VERY VERY IMPORTANT (EVERYONE SHOULD KNOW ABOUT IT):

    1). WHEN USER CREATE PROFILE AT THAT TIME THEY CHOOSE CATEGORY. THIS IS VERY CRUCIAL CATEGORY BASED WE SHOWN SUBSCRIPTIONPLAN AND RESPECTED PROPERTY AND SUBSERVICES. (THIS IS GOLDEN RULE).

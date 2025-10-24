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

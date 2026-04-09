# User Acceptance Testing (UAT) Plan

**Project Name:** Flatiron Meal Plan Map  
**Team:** 1  
**Environment:** Localhost (Docker / Node.js / PostgreSQL)  
**Browsers:** Google Chrome  
**Testers:** Ryan, Marie, Hayden, Pranav, Garrett (University students representing the target user base)

---

## 1. Overview
The purpose of this document is to define the User Acceptance Testing (UAT) process for the Flatiron Meal Plan Map. These tests ensure that the software meets the specified business requirements, handles real-world scenarios, and is ready for deployment.  

UAT will be executed during **Week 4** of the project. Testers will verify features, record observations, and confirm functionality against the acceptance criteria.

---

## 2. Test Environment & Data
- **Environment:** Localhost via Docker containers  
- **Databases:** PostgreSQL (`users`, `restaurants` tables)  
- **Test Data:** - `restaurants` table pre-populated with at least 5 sample entries (e.g., Illegal Pete's, Half Fast Subs).
    - `users` table reset at the start of each session.
    - Invalid input examples for testing validation (short usernames, mismatched passwords).
- **Recording:** Testers will document results using screenshots, database verification, and logs.  

---

## 3. Feature Testing Plans

### Feature 1: User Registration

#### **UAT-1.1: Submit valid registration form**
* **Description:** A new user attempts to create an account by filling out all mandatory fields with valid information.
* **Test Data:** Name: `Test User`, Email: `test@colorado.edu`, Username: `dev_tester`, Password: `Secure123`, Confirm Password: `Secure123`.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** Redirect to `/dashboard`; user record is successfully saved to the `users` table.
* **Tester Information:** Pranav (CU Boulder student; target demographic).
* **Actual Result:** [Pending]

#### **UAT-1.2: Submit non-matching passwords**
* **Description:** User attempts to register but provides two different passwords in the password and confirmation fields.
* **Test Data:** Password: `123456`, Confirm Password: `654321`.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** Registration fails; error message displayed: *"Passwords must match"*.
* **Tester Information:** Marie (University student; target demographic).
* **Actual Result:** [Pending]

#### **UAT-1.3: Submit short username**
* **Description:** User attempts to register with a username that does not meet the minimum length requirement (4 characters).
* **Test Data:** Username: `abc`.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** Registration fails; error message displayed: *"Invalid username"*.
* **Tester Information:** Ryan (University student; target demographic).
* **Actual Result:** [Pending]

---

### Feature 2: Secure Authentication (Login)

#### **UAT-2.1: Login with correct credentials**
* **Description:** An existing user attempts to log in to the application using valid credentials.
* **Test Data:** Username: `dev_tester`, Password: `Secure123`.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** Success; user is authenticated and redirected to the Dashboard.
* **Tester Information:** Hayden (University student; target demographic).
* **Actual Result:** [Pending]

#### **UAT-2.2: Login with incorrect password**
* **Description:** A user attempts to log in with a correct username but an incorrect password.
* **Test Data:** Username: `dev_tester`, Password: `WrongPass`.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** Login fails; error message displayed: *"Invalid username or password"*.
* **Tester Information:** Garrett (University student; target demographic).
* **Actual Result:** [Pending]

#### **UAT-2.3: Unauthorized page access**
* **Description:** An unauthenticated user attempts to bypass the login screen by entering a protected URL directly.
* **Test Data:** Direct URL navigation to `http://localhost:3000/dashboard`.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** Access denied; user is automatically redirected back to the `/login` page.
* **Tester Information:** Pranav (University student; target demographic).
* **Actual Result:** [Pending]

---

### Feature 3: Restaurant Recommendation Engine

#### **UAT-3.1: View Dashboard Recommendation**
* **Description:** A logged-in user views the dashboard to see if a restaurant recommendation is successfully pulled from the database.
* **Test Data:** Authenticated session; `restaurants` table contains at least 5 entries.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** The Dashboard displays exactly one restaurant name and its corresponding description.
* **Tester Information:** Marie (University student; target demographic).
* **Actual Result:** [Pending]

#### **UAT-3.2: Refresh Recommendation**
* **Description:** A user refreshes the dashboard to verify that the recommendation engine provides a new random restaurant.
* **Test Data:** Browser refresh action on the `/dashboard` route.
* **Test Environment:** Localhost (Docker / Node.js / PostgreSQL).
* **Expected Result:** The page reloads and displays a different restaurant name/description from the database.
* **Tester Information:** Ryan (University student; target demographic).
* **Actual Result:** [Pending]

---

## 4. Risk Assessment

**Technical Risks**
- **Database Connection:** Failure within Docker network. *Mitigation:* Use `depends_on` in `docker-compose.yaml`.
- **Security:** Passwords stored as plain text. *Mitigation:* Implement `bcryptjs` for hashing.

**Organizational/Business Risks**
- **Data Integrity:** Incomplete test data. *Mitigation:* Include `INSERT` statements in `init_data/create.sql`.
- **Schedule:** Delay in resource allocation. *Mitigation:* Adjust timeline and prioritize core features.

---

## 5. Test Execution Plan
- **Week 4:** Execute all UAT test cases.
- **Documentation:** Record actual results, screenshots, and database verification.
- **Review:** Confirm all features meet acceptance criteria before project submission.

---

## 6. Summary of Results (Week 4)
*To be filled out during the final testing phase.*

- **Total Tests Executed:** 0  
- **Total Passed:** 0  
- **Total Failed:** 0  

**Observations:**
- [Add any observations during testing here]

---

### 7. Automation Reference
- Automated verification will use **Mocha/Chai** for unit tests; UAT focuses on end-user experience.

---

**Prepared by:** Team 1  
**Date:** April 2026
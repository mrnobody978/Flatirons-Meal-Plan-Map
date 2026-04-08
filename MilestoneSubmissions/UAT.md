# User Acceptance Testing (UAT) Plan
**Project Name:** Flatiron Meal Plan Map  
**Team:** 1  
**Environment:** Localhost (Docker / Node.js / PostgreSQL)  
**Browsers:** Google Chrome  
**Testers:** Ryan, Marie, Hayden, Pranav, Garrett  

---

## 1. Overview
The purpose of this document is to define the User Acceptance Testing (UAT) process for the Flatiron Meal Plan Map. These tests ensure that the software meets the specified business requirements, handles real-world scenarios, and is ready for deployment.  

UAT will be executed during **Week 4** of the project. Testers will verify features, record observations, and confirm functionality against the acceptance criteria.

---

## 2. Test Environment & Data

- **Environment:** Localhost via Docker containers  
- **Databases:** PostgreSQL (`users`, `restaurants` tables)  
- **Test Data:**  
  - `restaurants` table pre-populated with at least 5 sample entries  
  - `users` table reset at the start of each session  
  - Invalid input examples for testing validation (short usernames, mismatched passwords, invalid characters)  
- **Recording:** Testers will document results using screenshots, database verification, and logs.  

---

## 3. Feature Testing Plans

### Feature 1: User Registration
**Acceptance Criteria:**  
- Users must provide a **unique username** and a **password**.  
- Username length: **4–50 characters**.  
- Password length: **6–50 characters**.  
- Password and confirmation must match exactly.  
- Mandatory fields: Name, Email, Password, Confirm Password.  
- Data persists in the `users` table after submission.  
- Clear error messages displayed for invalid input.  

#### Test Cases

**UAT-1.1**  
- **User Activity:** Submit valid registration form  
- **Test Data:**  
  - Username: `dev_tester`  
  - Password: `Secure123`  
  - Confirm Password: `Secure123`  
  - Name and Email filled  
- **Expected Result:** Redirect to `/dashboard`; user is saved to database  
- **Actual Result:** [Pending]  

---

**UAT-1.2**  
- **User Activity:** Submit non-matching passwords  
- **Test Data:**  
  - Password: `123456`  
  - Confirm Password: `654321`  
- **Expected Result:** Error message displayed: *"Passwords must match"*  
- **Actual Result:** [Pending]  

---

**UAT-1.3**  
- **User Activity:** Submit username with fewer than 4 characters  
- **Test Data:**  
  - Username: `abc`  
- **Expected Result:** Error message displayed: *"Invalid username"*  
- **Actual Result:** [Pending]  

---

### Feature 2: Secure Authentication (Login)
**Acceptance Criteria:**  
- User must log in with valid credentials to access protected routes (e.g., `/dashboard`).  
- Invalid credentials trigger *"Invalid username or password"* feedback.  
- Unauthorized access redirects to `/login`.  

#### Test Cases

**UAT-2.1**  
- **User Activity:** Login with correct credentials  
- **Test Data:**  
  - Username: `dev_tester`  
  - Password: `Secure123`  
- **Expected Result:** Success; redirected to Dashboard  
- **Actual Result:** [Pending]  

---

**UAT-2.2**  
- **User Activity:** Login with incorrect password  
- **Test Data:**  
  - Username: `dev_tester`  
  - Password: `WrongPass`  
- **Expected Result:** Error message displayed: *"Invalid username or password"*  
- **Actual Result:** [Pending]  

---

**UAT-2.3**  
- **User Activity:** Unauthorized page access  
- **Test Data:**  
  - Direct access to `/dashboard` via URL  
- **Expected Result:** Redirected back to `/login` page  
- **Actual Result:** [Pending]  

---

### Feature 3: Restaurant Recommendation Engine
**Acceptance Criteria:**  
- Dashboard displays a random restaurant name and description from the database.  
- Refreshing the page updates the recommendation with a new restaurant.  
- Must handle empty or incomplete restaurant table gracefully.  

#### Test Cases

**UAT-3.1**  
- **User Activity:** View Dashboard  
- **Test Data:** Logged-in session  
- **Expected Result:** Display 1 restaurant with name and description  
- **Actual Result:** [Pending]  

---

**UAT-3.2**  
- **User Activity:** Refresh Recommendation  
- **Test Data:** Logged-in session  
- **Expected Result:** New random restaurant displayed from database  
- **Actual Result:** [Pending]  

---

## 4. Risk Assessment

**Technical Risk 1**  
- **Description:** Database connection fails within Docker network  
- **Mitigation Strategy:** Use `depends_on` in `docker-compose.yaml`  

---

**Technical Risk 2**  
- **Description:** Passwords stored as plain text (security risk)  
- **Mitigation Strategy:** Implement `bcryptjs` for all password storage  

---

**Organizational Risk 1**  
- **Description:** Incomplete test data (empty restaurant table)  
- **Mitigation Strategy:** Include `INSERT` statements in `init_data/create.sql`  

---

**Business Risk 1**  
- **Description:** Delay in project funding or resources affects testing schedule  
- **Mitigation Strategy:** Adjust timeline, allocate internal resources for testing  

---

## 5. Test Execution Plan

- **Week 4:** Execute all UAT test cases  
- **Documentation:** Record actual results, screenshots, DB verification  
- **Review:** Confirm all features meet acceptance criteria before project submission  

---

## 6. Summary of Results (Week 4)
*To be filled out during the final testing phase.*  

**Total Tests Executed:** 0  
**Total Passed:** 0  
**Total Failed:** 0  

**Notes:**  
- [Add any observations during testing here]  

---

### 7. Automation Reference
- Automated verification will use **Mocha/Chai** for unit tests; UAT focuses on end-user experience.  

---

**Prepared by:** Team 1  
**Date:** [Insert Date]  
// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Default route for accounts
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
// Route to build account by classification view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to build registration
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )
// Process the login attempt
router.post(
  "/login",
    regValidate.loginRules(),
    regValidate.checkLogData,
    utilities.handleErrors(accountController.accountLogin)
)
// Route to account management view
router.get("/management", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
// Route to logout
router.get("/logout", utilities.handleErrors(accountController.logoutAccount))
// Route  to build update account view
router.get("/update-account/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))
// Process account update
router.post("/update-account", 
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)
// Process password update
router.post("/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;
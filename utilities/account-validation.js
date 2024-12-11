const accountModel = require("../models/account-model")
const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  /*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
  validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required."),
        // .custom(async (account_email) => {
        //   const emailExists = await accountModel.checkExistingEmail(account_email)
        //   if (emailExists){
        //     throw new Error("Email exists. Please log in or use different email")
        //   }
        // }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
  * Check data and return errors or continue to login
  * ***************************** */
  validate.checkLogData = async (req, res, next) => {
    const account_email = req.body?.account_email || ''

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.render("account/login", {
            errors,
            title: "Login",
            nav,
            message: "",
            account_email,
        })
    }
    next()
}

  /* ******************************
  * Check data and return errors or continue to registration
  * ***************************** */
  validate.checkRegData = async (req, res, next) => {
    const account_firstname = req.body?.account_firstname || ''
    const account_lastname = req.body?.account_lastname || ''
    const account_email = req.body?.account_email || ''

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            message: "",
            account_firstname,
            account_lastname,
            account_email,
        })
    }
    next()
}

/* ******************************
* Account Update Data Validation Rules
* ***************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const emailExists = await accountModel.checkExistingEmail(account_email)
        const accountData = await accountModel.getAccountById(account_id)

        if (emailExists && accountData.account_email !== account_email){
          throw new Error("Email exists. Please use a different email")
        }
        return true
      }),
  ]
}

/* ******************************
* Password Update Validation Rules
* ***************************** */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
* Check data and return errors or continue to account update
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
* Check password data
* ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_password } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      errors,
      title: "Edit Account",
      nav,
      account_password,
    })
    return
  }
  next()
}

module.exports = validate
const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      message: "",
      errors: null,
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
let hashedPassword
try {
  // regular password and cost (salt is generated automatically)
  hashedPassword = await bcrypt.hashSync(account_password, 10)
} catch (error) {
  req.flash("notice", 'Sorry, there was an error processing the registration.')
  res.status(500).render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  })
}

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    message: "",
    errors: null,
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.flash("notice", "You're logged in!")
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ***************************
 *  Build account management view
 * ************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const accountData = await accountModel.getAccountById(account_id)

  res.render("./account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData
  })
}

/* ****************************************
*  Process logout
* *************************************** */
async function logoutAccount(req, res) {
  try {
    res.clearCookie("jwt")
    return res.redirect("/")
  } catch (error) {
    throw new Error('Error logging out')
  }
}

/* ***************************
 *  Build account update view
 * ************************** */
async function buildAccountUpdate(req, res) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.accountId)
  const accountData = await accountModel.getAccountById(account_id)
  res.render("./account/update-account", {
    title: "Edit Account",
    nav,
    errors: null,
    accountData,
  })
}

/* ***************************
 *  Process account update
 * ************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id
  } = req.body
  
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    req.flash("notice", "The account was successfully updated.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
}

/* ***************************
 *  Process password update
 * ************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the update.")
    res.status(500).render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
    })
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (updateResult) {
    req.flash("notice", "The password was successfully updated.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
    })
  }
}

module.exports = { buildLogin, registerAccount, buildRegister, accountLogin, buildAccountManagement, logoutAccount, buildAccountUpdate, updateAccount, updatePassword }
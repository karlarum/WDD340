const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

 /* ******************************
* Add Classification Data Validation Rules
* ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name can only contain letters and numbers.")
      .custom(async (classification_name) => {
        const classificationExists = await inventoryModel.checkExistingClassification(classification_name)
        if (classificationExists){
          throw new Error("Classification exists. Please use a different name")
        }
      }),
  ]
}

/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/* ******************************
* Add Inventory Data Validation Rules
* ***************************** */
validate.addInventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .isNumeric()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide the vehicle make."),

    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide the vehicle model."),

    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle description."),

    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide an image path."),

    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a thumbnail path."),

    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Please provide a valid price."),

    body("inv_year")
      .trim()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("Please provide a valid 4-digit year."),

    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Please provide valid mileage."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a color."),
  ]
}

/* ******************************
* Check inventory data and return errors or continue
* ***************************** */
validate.checkAddInventoryData = async (req, res, next) => {
  const { 
    classification_id, 
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color 
  } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

/* ******************************
* Errors will be directed back to the edit view
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { 
    classification_id, 
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    inv_id 
  } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit New Vehicle",
      nav,
      classificationSelect,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id
    })
    return
  }
  next()
}

module.exports = validate
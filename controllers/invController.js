const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const pool = require("../database/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getInventorybyInvId(inv_id)
  const vehicleHTML = await utilities.buildVehicleDetail(data)
  let nav = await utilities.getNav()
  const vehicleName = data[0].inv_make + ' ' + data[0].inv_model
  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    vehicleHTML,
  })
}

/* ***************************
 *  Build vehicle management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  
  try {
    const regResult = await invModel.addClassification(classification_name)
    
    if (regResult) {
      req.flash(
        "notice",
        `The ${classification_name} classification was successfully added.`
      )
      let nav = await utilities.getNav()
      const classificationSelect = await utilities.buildClassificationList()
      res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationSelect,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the addition failed.")
      res.status(501).render("inventory/add-classification", {
        title: "Add New Classification",
        nav: await utilities.getNav(),
        errors: null,
      })
    }
  } catch (error) {
    console.error('addClassification error: ', error)
    next(error)
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
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

  const regResult = await invModel.addInventory(
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
  )

  if (regResult) {
    req.flash(
      "notice",
      `The ${inv_make} ${inv_model} was successfully added.`
    )
    let nav = await utilities.getNav()
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the addition failed.")
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
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
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId)
    let nav = await utilities.getNav()
    
    const itemData = await invModel.getInventorybyInvId(inv_id)
    
    if (!itemData || !itemData[0]) {
      req.flash("notice", "Sorry, we couldn't find that inventory item.")
      res.redirect("/inv")
      return
    }

    const data = itemData[0] 
    const classificationSelect = await utilities.buildClassificationList(data.classification_id)
    const itemName = `${data.inv_make} ${data.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: data.inv_id,
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_description: data.inv_description,
      inv_image: data.inv_image,
      inv_thumbnail: data.inv_thumbnail,
      inv_price: data.inv_price,
      inv_miles: data.inv_miles,
      inv_color: data.inv_color,
      classification_id: data.classification_id
    })
  } catch (error) {
    console.error("Error in editInventoryView:", error)
    req.flash("notice", "Sorry, there was an error processing your request.")
    res.redirect("/inv")
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    
    const itemData = await invModel.getInventorybyInvId(inv_id)
    
    if (!itemData || !itemData[0]) {
      req.flash("notice", "Sorry, we couldn't find that inventory item.")
      res.redirect("/inv")
      return
    }

    const data = itemData[0]
    const itemName = `${data.inv_make} ${data.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: data.inv_id,
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_price: data.inv_price,
    })
  } catch (error) {
    console.error("Error in deleteInventoryView:", error)
    req.flash("notice", "Sorry, there was an error processing your request.")
    res.redirect("/inv")
  }
}

/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The vehicle was deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect("/inv/delete/" + inv_id)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build delete classification view
 * ************************** */
invCont.deleteClassificationView = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id)
    let nav = await utilities.getNav()
    
    // Check if classification exists and has no vehicles
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData && invData.length > 0) {
      req.flash("notice", "Cannot delete classification with existing vehicles.")
      res.redirect("/inv")
      return
    }
    
    // Get classification details
    const sql = "SELECT * FROM classification WHERE classification_id = $1"
    const data = await pool.query(sql, [classification_id])
    
    if (!data.rows[0]) {
      req.flash("notice", "Sorry, we couldn't find that classification.")
      res.redirect("/inv")
      return
    }

    const classification = data.rows[0]

    res.render("./inventory/delete-classification", {
      title: "Delete " + classification.classification_name,
      nav,
      errors: null,
      classification_id: classification.classification_id,
      classification_name: classification.classification_name,
    })
  } catch (error) {
    console.error("Error in deleteClassificationView:", error)
    req.flash("notice", "Sorry, there was an error processing your request.")
    res.redirect("/inv")
  }
}

/* ***************************
 *  Process Delete Classification
 * ************************** */
invCont.deleteClassification = async function (req, res, next) {
  const classification_id = parseInt(req.body.classification_id)

  const deleteResult = await invModel.deleteClassification(classification_id)

  if (deleteResult) {
    req.flash("notice", "The classification was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect("/inv/")
  }
}

module.exports = invCont
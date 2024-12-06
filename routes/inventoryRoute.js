// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

// Route to build vehicle management view
router.get("/", utilities.handleErrors(invController.buildManagementView));
// Route to build add-classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
// Process the add-classification view
router.post("/add-classification", utilities.handleErrors(invController.addClassification));
// Route to build add-inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
// Process add new inventory data
router.post(
  "/add-inventory", 
  invValidate.addInventoryRules(),
  invValidate.checkAddInventoryData,
  utilities.handleErrors(invController.addInventory)
);
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
  

module.exports = router;
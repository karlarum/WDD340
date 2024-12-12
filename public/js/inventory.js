'use strict' 
 
 // Get a list of items in inventory based on the classification_id 
 let classificationList = document.querySelector("#classificationList")
 classificationList.addEventListener("change", function () { 
  let classification_id = classificationList.value 
  console.log(`classification_id is: ${classification_id}`) 
  let classIdURL = "/inv/getInventory/"+classification_id 
  fetch(classIdURL) 
  .then(function (response) { 
   if (response.ok) { 
    return response.json(); 
   } 
   throw Error("Network response was not OK"); 
  }) 
  .then(function (data) { 
   console.log(data); 
   buildInventoryList(data); 
  }) 
  .catch(function (error) { 
   console.log('There was a problem: ', error.message) 
  }) 
 })

 // Build inventory items into HTML table components and inject into DOM 
 function buildInventoryList(data) { 
    let inventoryDisplay = document.getElementById("inventoryDisplay"); 
    let dataTable = '';
    
    if (!data || data.length === 0) {
        let classification_id = document.getElementById("classificationList").value;
        dataTable = '<div class="no-vehicles">';
        dataTable += '<p>No vehicles found in this classification.</p>';
        dataTable += `<p><a href='/inv/delete-classification/${classification_id}' class="delete-btn">Delete this Classification</a></p>`;
        dataTable += '</div>';
    } else {
        dataTable = '<thead>'; 
        dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
        dataTable += '</thead>'; 
        dataTable += '<tbody>'; 
        data.forEach(function (element) { 
            dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
            dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
            dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
        }); 
        dataTable += '</tbody>'; 
    }
    
    inventoryDisplay.innerHTML = dataTable; 
}

/*
This script automates the process of creating a general reimbursement form
/*
  
/*
name: getPrevInfoByName
arguments: name of the person whose info is being fetched
returns: a dictionary of contact info if found, an empty dict otherwise
details: Searches previous rows for a row with that name, copies the contact info into a dict
*/
function getPrevInfoByName(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Form Responses 1")
  var sheetValues = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues()
  sheetValues = sheetValues.reverse()
  const oldRow = sheetValues.find((values) => 
    values[1].toLowerCase() == name.toLowerCase() &&
    values[4].toLowerCase() == "yes"
  )
  if (oldRow) {
    const localAddressSplit = oldRow[7].split(",")
    const permAddressSplit = oldRow[8].split(",")
    return {
      "studentId": oldRow[5],
      "directDeposit": oldRow[6],
      "localAddress": localAddressSplit.slice(0, 1),
      "localCSZ": localAddressSplit.slice(1, localAddressSplit.length),
      "permAddress": permAddressSplit.slice(0, 1),
      "permCSZ": permAddressSplit.slice(1, permAddressSplit.length),
      "phone": oldRow[9],
      "email": oldRow[10],
    }
  } else {
    return {}
  }
  
}

/* 
name: autoFillGoogleDocFromForm
arguments: form submission event
returns: None
details: Triggered on a form submission. Grabs the relevant form data and
         constructs a folder containing a filled out general reimbursement
         form alongside a copy of the recipt
*/
function autoFillGoogleDocFromForm(event) {
  // grab form values
  const localAddressSplit = event.values[7].split(",")
  const permAddressSplit = event.values[8].split(",")
  var formValues = {
    "timeStamp": event.values[0],
    "fullName": event.values[1],
    "eventName": event.values[2],
    "recieptUrl": event.values[3],
    "studentId": event.values[5],
    "directDeposit": event.values[6],
    "localAddress": localAddressSplit.slice(0, 1),
    "localCSZ": localAddressSplit.slice(1, localAddressSplit.length),
    "permAddress": permAddressSplit.slice(0, 1),
    "permCSZ": permAddressSplit.slice(1, permAddressSplit.length),
    "phone": event.values[9],
    "email": event.values[10],
    "amount": event.values[11],
    "lineItem": event.values.slice(12, event.values.length).join(""),
  }
  const instanceName = formValues["timeStamp"] + ": " + formValues["fullName"]

  // update with previous info if they've already entered their contact info
  if (event.values[4].toLowerCase() == "no") {
    const prevInfo = getPrevInfoByName(formValues["fullName"])
    formValues = {
      ...formValues,
      ...prevInfo,
    }
  }
  
  // create folder and copy template file
  const sourceTemplateFile = DriveApp.getFileById("1bEVNwtqHO6b--7m_WhJit3K3HuEm7aBua98GCH7OQX8"); 
  const parentFolder = DriveApp.getFolderById("1hzFwMsjIa60JA10cs2OUeaEAE8D2m2N1");
  const destinationFolder = parentFolder.createFolder(instanceName)
  const destinationFile = sourceTemplateFile.makeCopy(instanceName, destinationFolder);

  // copy reciept file
  const receiptFile = DriveApp.getFileById(formValues["recieptUrl"].split("id=")[1])
  receiptFile.makeCopy(instanceName, destinationFolder);
  
  // get document body
  const doc = DocumentApp.openById(destinationFile.getId()); 
  const body = doc.getBody(); 
  
  // replace template values with values from form
  for (const [key, value] of Object.entries(formValues)) {
    body.replaceText("{" + key + "}", value); 
  }
  
  doc.saveAndClose(); 
}
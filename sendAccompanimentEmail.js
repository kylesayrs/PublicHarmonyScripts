ACCOMPANIMENT_KEYWORD = "accompaniment"
RECIPIENTS = []


function sendMailToRecipients(recipients, subject, body) {
  recipients.forEach((recipient) => {
    GmailApp.sendEmail(recipient, subject, body)
  })
}

function formResponseToString(formResponse) {
  result_string = ""
  console.log(formResponse.getItemResponses())
  formResponse.getItemResponses().forEach((itemResponse) => {
    result_string += `${itemResponse.getItem().getTitle()}: ${itemResponse.getResponse()}\n`
  })
  return result_string
}

function sendAccompanimentEmail(event) {
  try {
    const formItems = event.source.getItems()
    const wantsAccompanimentItem = formItems.find((formItem) => formItem.getTitle().toLowerCase().includes(ACCOMPANIMENT_KEYWORD))

    if (wantsAccompanimentItem) {
      const wantsAccompanimentResponse = event.response.getResponseForItem(wantsAccompanimentItem)
      if (wantsAccompanimentResponse && wantsAccompanimentResponse.getResponse().toLowerCase().includes("y")) {
        const emailBody = formResponseToString(event.response)
        sendMailToRecipients(RECIPIENTS, "Musical Accompaniment Request", emailBody)
      }
    }
  } catch (error) {
    sendMailToRecipients(RECIPIENTS, "The accompaniment script failed", error.toString())
  }
}

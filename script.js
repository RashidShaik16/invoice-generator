import {generatePDF} from "./generatePdf.js"

const downloadBtn = document.getElementById("download-btn")
const previewBtn = document.getElementById("pdf-preview-btn")
const customers = document.getElementById("customers")
const billToManual = document.getElementById("bill-to-manual")
const customerAddress = document.getElementById("customer-address")
const billTo = document.getElementById("bill-to")


const clientAddresses = [
  {
    client: "KM Homes",
    address: `6225 Windward Pkwy,
Alpharetta, GA 30005`
  }
]

customers.addEventListener("change", function() {
  if(customers.value === "others"){
    billToManual.classList.remove("hidden")
    customerAddress.value = ""
  } else if(customers.value === "KM Homes") {
    billTo.value = ""
    billToManual.classList.add("hidden")
    customerAddress.value = clientAddresses[0].address
  }
})


// Fix for local timezone
const today = new Date();
today.setHours(0, 0, 0, 0); // reset to local midnight
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");

document.querySelector("input[type='date']").setAttribute("max", `${yyyy}-${mm}-${dd}`);





// Add item button
document.getElementById("add-item").addEventListener("click", () => {
  const container = document.getElementById("items-container");
  const lastRow = container.lastElementChild;
  const inputs = lastRow.querySelectorAll("input");

  // Check if all fields in the last row are filled
  const allFilled = Array.from(inputs).every(input => input.value.trim() !== "");

  if (!allFilled) {
    alert("Please fill out the current item before adding a new one.");
    return;
  }

  // Create new row
  const row = document.createElement("div");
  row.className = "grid grid-cols-5 gap-2 md:grid-cols-7 sm:grid-cols-6";

  row.innerHTML = `
              <input type="text" class="border rounded p-2 col-span-2 md:col-span-4 sm:col-span-3" placeholder="Description" required>
              <input type="number" class="border rounded p-2" placeholder="Qty" required>
              <input type="number" class="border rounded p-2" placeholder="Rate" required>
              <button type="button" class="remove-item bg-red-700 text-white px-2 rounded cursor-pointer">Del</button>
  `;

  container.appendChild(row);
});

// Handle remove item button
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-item")) {
    const container = document.getElementById("items-container");
    if (container.children.length > 1) {
      e.target.parentElement.remove();
    } else {
      alert("At least one item is required.");
    }
  }
});



function collectInvoiceData() {
    const companySelected = document.getElementById("company-select").value
     const customerId = document.getElementById("customer-id").value || "--"
    const invoiceDate = document.querySelector("input[type='date']").value
    const terms = document.getElementById("terms").value
    const invoiceNo = document.getElementById("invoice-no").value || "--"
    const billTo = document.getElementById("bill-to").value
    const customers = document.getElementById("customers").value
    const customerAddress = document.getElementById("customer-address").value
    const freight = document.getElementById("freight").value
    const tax = document.getElementById("tax").value

    
    // checks
      if (!companySelected) {
          alert("Please select a company before generating the invoice.");
          return
        } 

      if(!invoiceDate) {
        alert("Please select the date.");
        return
      } 

      if(!billTo && !customers) {
        alert("Please choose your client before generating the invoice.");
        return
      } 

       if(!billTo && customers === "others") {
        alert("Please enter the client name before generating the invoice.");
        return
      } 

     

    // Items
  const itemRows = document.querySelectorAll("#items-container .grid");
  const items = []
  let subTotal = 0
  itemRows.forEach(row => {
    const desc = row.querySelector("input[placeholder='Description']").value
    const qty = row.querySelector("input[placeholder='Qty']").value
    const rate = row.querySelector("input[placeholder='Rate']").value
  

    if (desc && qty && rate) {
    subTotal += (rate * qty)
    items.push({ desc, qty: Number(qty), rate: Number(rate) })
  }

  })


    if(items.length === 0) {
    alert("Please enter at least 1 item to generate the invoice");
    return
  } 

const freightNum = Number(freight) || 0;
const taxNum = Number(tax) || 0;
const subTotalNum = Number(subTotal) || 0;
const totalNum = subTotalNum + freightNum + taxNum;

  const invoiceData = {
    companySelected,
    customerId,
    invoiceDate,
    terms,
    invoiceNo,
    billTo,
    customers,
    customerAddress,
    items,
    freight: freightNum.toFixed(2),
    tax: taxNum.toFixed(2),
    subTotal: subTotalNum.toFixed(2),
    total: totalNum.toFixed(2)
  }

  return invoiceData

}




let lastUrl = null

// Preview button
previewBtn.addEventListener("click", () => {
  const invoiceData = collectInvoiceData();
  if (!invoiceData) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const { doc, url } = generatePDF(invoiceData);

  // Revoke old URL if one exists
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = url;

  if (isMobile) {
    window.open(url, "_blank");
  } else {
    const iframe = document.getElementById("pdf-preview");
    iframe.src = "about:blank";
    setTimeout(() => { iframe.src = url; }, 50);
  }
});

// Download button
downloadBtn.addEventListener("click", () => {
  const invoiceData = collectInvoiceData();
  if (!invoiceData) return;

  const { doc, url } = generatePDF(invoiceData);

  // Save PDF file
  const clientName = billTo.value === "" ? customers.value : billTo.value
  doc.save(`invoice-${clientName}-${invoiceData.invoiceNo}` || "Invoice.pdf");

  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Revoke old preview URL
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = url;

  if (isMobile) {
    window.open(url, "_blank");
  } else {
    const iframe = document.getElementById("pdf-preview");
    iframe.src = "about:blank";
    setTimeout(() => { iframe.src = url; }, 50);
  }
});




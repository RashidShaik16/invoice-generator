export function generatePDF(invoiceData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  const { companySelected, customerId, invoiceDate, terms, invoiceNo, billTo, customers, customerAddress, items, freight, tax, subTotal, total } = invoiceData


  let color = undefined
  let logoSize = undefined
  let address = undefined
  let name = undefined
  let email = undefined
  
  companySelected === "fabtran" ? color = [191, 13, 62] : companySelected === "fablot" ? color = [176, 156, 46] : color = [30, 112, 191]
  companySelected === "fabtran" ? logoSize = [50, 20] : companySelected === "fablot" ? logoSize = [50, 25] : logoSize = [85, 18]
  companySelected === "fabtran" ? address = "Atlanta, GA, USA" : companySelected === "fablot" ? address = "Alpharetta, GA" : address = "8161 Theodore Dawes Rd, Theodore, AL 36582"
  companySelected === "fabtran" ? name = "Fabtran" : companySelected === "fablot" ? name = "Fablot" : name = "Gulf Coast Fabricators"
  companySelected === "fabtran" ? email = "mo@fabtran.com" : companySelected === "fablot" ? email = "mo@fablot.com" : email = "mo@gcfabco.com"

  const formatCurrency = (num) => 
  new Intl.NumberFormat("en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(num)


  // logo
  const companyLogo = document.getElementById("company-logo").src = `${companySelected}.png`
  doc.addImage(companyLogo, "PNG", 15, 15, ...logoSize)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(25)
  doc.setTextColor(...color)
  const pageWidth = doc.internal.pageSize.getWidth()
  const invoiceText = "INVOICE"
  const textWidth = doc.getTextWidth(invoiceText)
  const x = pageWidth - textWidth - 15
  const y = 25;
  doc.text(invoiceText, x, y);

  doc.setFontSize(12)
  doc.setTextColor(120)
  doc.text(`#${invoiceNo}`, pageWidth-35, 31)

  // from
  doc.setFontSize(10)
  doc.text("From:", 15, 50)

  doc.setTextColor(50)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(name, 15, 57)

  // from address
  
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(address, 15, 62)
  


  // to
  doc.setTextColor(120)
  doc.setFontSize(10)
  doc.text("To:", 15, 72)

  // Customer name
  const customerName = customers === "KM Homes" ? "KM Homes" : billTo
  doc.setTextColor(50)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(customerName, 15, 79)

  // Customer address
  doc.setFontSize(10)
  doc.setTextColor(120)
  const wrappedAddress = doc.splitTextToSize(customerAddress, 80); 
  doc.text(wrappedAddress, 15, 84)
  // doc.text(customerAddress, 15, 84)

  // headings
  doc.setTextColor(120)
  doc.setFontSize(10)
  doc.text("Customer ID:", 140, 50)
  doc.text("Invoice Date:", 140, 58)
  doc.text("Terms:", 140, 66)
  doc.text("Invoice No.:", 140, 74)

  // values
  doc.setTextColor(50)
  doc.setFontSize(11)
  doc.text(customerId, 172, 50)
  doc.text(invoiceDate, 172, 58)
  doc.text(terms, 172, 66)
  doc.text(invoiceNo, 172, 74)

  // Items table
  doc.autoTable({
    startY: 108,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: items.map(item => [
      item.desc,
      item.qty,
      `$${formatCurrency(item.rate)}`,
      `$${formatCurrency(item.qty * item.rate)}`
    ]),
    columnStyles: {
      0: { cellWidth: 100, halign: 'left' },
      1: { cellWidth: 20, halign: 'left' },
      2: { cellWidth: 30, halign: 'left' },
      3: { cellWidth: 30, halign: 'left' }
    },
    styles: { fontSize: 10, lineWidth: 0, textColor: 0 },
    headStyles: { fillColor: [...color], textColor: [255,255,255], lineWidth: 0, fontSize: 11},
    bodyStyles: { fillColor: [255,255,255], lineWidth: 0, cellPadding: 2, fontSize: 11},
    theme: 'plain',
  });

  // Subtotal table
  let finalY = doc.lastAutoTable.finalY + 5
  const tableX = 115
  const tableWidth = 80
  const totals = [
    ["Subtotal", `$${formatCurrency(subTotal)}`],
    ["Freight Charge", `$${formatCurrency(freight)}`],
    ["Tax", `$${formatCurrency(tax)}`],
    ["Total Due", `$${formatCurrency(total)}`]
  ]

  // --- Horizontal separator line above subtotal ---
  const lineY = finalY - 3;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(tableX, lineY, tableX + tableWidth, lineY);

  // Subtotal table itself
  doc.autoTable({
    startY: finalY,
    margin: { left: tableX },
    body: totals,
    columnStyles: {
      0: { cellWidth: 40, halign: 'left' },
      1: { cellWidth: 40, halign: 'center' }
    },
    theme: 'plain',
    styles: { fontSize: 11, lineWidth: 0, textColor: 0, cellPadding: 2 },
    bodyStyles: { fillColor: [255,255,255] },
    didParseCell: function(data) {
      if (data.row.index === totals.length - 1) {
        data.cell.styles.fillColor = [...color];
        data.cell.styles.textColor = [255,255,255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 13;
      }
    }
  });

  finalY = doc.lastAutoTable.finalY + 15;

  // Add new page if not enough space
  if (finalY > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    finalY = 40;
  }

  // Business Note
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("We appreciate your Business, Thank you.", 15, finalY);

  finalY += 8;

  // Horizontal line
  doc.setDrawColor(150);
  doc.setLineWidth(0.5);
  doc.line(15, finalY, 195, finalY);

  finalY += 8;

  // Terms & Conditions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Terms & Conditions", 15, finalY);

  finalY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50);

  const termsText = [
    "Payments can be made via mailed Check, ACH Payment, or Credit Card.",
    "Credit Card Payments will add 2.5% Processing Fee.",
    "Questions regarding the invoice, please contact"
  ];

  termsText.forEach(line => {
    const splitLine = doc.splitTextToSize(line, 180);
    doc.text(splitLine, 15, finalY);
    finalY += splitLine.length * 5;
  });

 

  // Phone
  doc.setTextColor(50);
  doc.text("678-736-0139 or", 83, finalY - 5);

   // Email clickable
  doc.setTextColor(0, 0, 255);
  doc.textWithLink(email, 108, finalY - 5, { url: `mailto:${email}` });

  // Preview
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  // const iframe = document.getElementById("pdf-preview");
  // iframe.src = "about:blank";
  // setTimeout(() => { iframe.src = url; }, 50);
  // setTimeout(() => URL.revokeObjectURL(url), 10000)


  // Return the doc object
  return {doc, url}
}

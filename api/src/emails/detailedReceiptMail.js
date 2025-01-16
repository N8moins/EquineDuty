
const {sendEmail} = require('./nodemailer');

/**
 * Send an email for the bill of the inscription
 * @param {string} email email address of the receiver
* @param {Object} inscription inscription
* @param {int} inscriptionId inscription id
*/
function sendDetailedBill(email, inscription, inscriptionId) {
  const arrayClass = inscription.entries[0].entry_fees.map((entry) => `
  <tbody>
  <tr>
    <td>${entry.class_number}</td>
    <td>${entry.class_name}</td>
    <td>${entry.test}</td>
    <td>${inscription.entries[0].rider_name}</td>
    <td>${inscription.entries[0].horse_name}</td>
</tr>
</tbody>
`).join('');

  const arraybundle = inscription.entries[0].stall_fees.map((bundle) => `
  <tbody>
  <tr>
    <td>${bundle.description}</td>
    <td>${bundle.quantity}</td>
    <td>${bundle.rate}</td>
    <td>${bundle.extension}</td>
</tr>
</tbody>
`).join('');

  const arrayOtherFees = inscription.entries[0].other_fees
      .filter((fee) => fee.quantity > 0).map((fee) => `
      <tbody>
      <tr>
      <td>${fee.description}</td>
      <td>${fee.quantity}</td>
      <td>${fee.rate}</td>
      <td>${fee.extension}</td>
  </tr>
  </tbody>
`).join('');

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Detailed Bill</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
          }

          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
          }

          .logo {
              text-align: center;
              margin-bottom: 20px;
          }

          .logo img {
              width: 150px;
              height: 44px;
              object-fit: cover;
          }

          .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
          }

          .subtitle {
              font-size: 16px;
              color: #888;
              margin-bottom: 20px;
          }

          .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
          }

          .grid-item {
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 5px;
          }

          .grid-item h1 {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
          }

          .grid-item p {
              font-size: 14px;
              color: #888;
          }

          .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
          }

          .table th,
          .table td {
              padding: 10px;
              border: 1px solid #ccc;
          }

          .table th {
              background-color: #f0f0f0;
              font-size: 12px;
              text-transform: uppercase;
              font-weight: bold;
              color: #888;
          }

          .table td {
              font-size: 14px;
          }

          .total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
          }

          .totalAmount {
            text-align: right;
            font-size: 20px;
            font-weight: bold;
            margin-top: 20px;
        }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="title">Competition Entry Receipt</div>
          <div class="subtitle"># ${inscriptionId}</div>
          <div class="grid">
              <div class="grid-item">
                  <h1>Competition Start Date</h1>
                  <p>${inscription.informations.competition_date}</p>
              </div>
              <div class="grid-item">
                  <h1>Competition</h1>
                  <p>${inscription.informations.competition_name}</p>
              </div>
              <div class="grid-item">
                  <h1>Address</h1>
                  <p>${inscription.informations.competition_adress}</p>
              </div>
              <div class="grid-item">
                  <h1>Date</h1>
                  <p>${new Date()}</p>
              </div>
              <div class="grid-item">
                  <h1>Secretary</h1>
                  <p>${inscription.informations.secretary_name}</p>
              </div>
              <div class="grid-item">
                  <h1>Email</h1>
                  <p>${inscription.informations.secretary_email}</p>
              </div>
              <div class="grid-item">
                  <h1>Phone</h1>
                  <p>${inscription.informations.secretary_phone}</p>
              </div>
          </div>
          <div>
              <h1>Entry Details</h1>
              <table class="table">
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>Class</th>
                          <th>Test</th>
                          <th>Rider</th>
                          <th>Horse</th>
                      </tr>
                  </thead>
                  <tbody>

                      ${arrayClass}

              </table>
          </div>
          <div>
              <h1>Stable Fees</h1>
              <table class="table">
                  <thead>
                      <tr>
                          <th>Description</th>
                          <th>Quantity</th>
                          <th>Rate</th>
                          <th>Extension</th>
                      </tr>
                  </thead>
                      ${arraybundle}
              </table>
          </div>
          <div class="total">
              Total Stable Fees: ${inscription.entries[0].total_stable_fees}
          </div>
          <div>
          <h1>Show Fees</h1>
          <table class="table">
              <thead>
                  <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Extension</th>
                  </tr>
              </thead>
                  ${arrayOtherFees}
          </table>
      </div>
      <div class="total">
        Total Stable Fees: ${inscription.entries[0].total_other_fees}
      </div>
      <div class="totalAmount">
      Total: ${inscription.total_fees}
    </div>
      </div>

  </body>
  </html>
`;

  sendEmail(email,
      'Bill for show ' + inscription.informations.competition_name,
      htmlContent);
}


module.exports = {sendDetailedBill};

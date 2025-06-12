<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
  <title>Internship Offer Letter</title>
  <style>
    body {
font-family: 'Times New Roman', serif;
background: url('${blurredImage}') no-repeat center center;
      background-size: 60%;
      margin: 0;
      padding: 25px 40px;
      position: relative;
    }

.logo {
position: fixed;
top: 10px;
right: 7px;
}

.logo img {
max-width: 90px;
height: auto;
}

.content {
margin-top: 70px;
background: rgba(255, 255, 255, 0.95);
padding: 25px 30px;
border-radius: 8px;
}

.title {
text-align: center;
font-weight: bold;
font-size: 16pt;
margin-bottom: 25px;
}

p {
margin: 14px 0;
font-size: 11pt;
line-height: 1.6;
}

.section-title {
margin-top: 20px;
font-weight: bold;
}

.signature {
margin-top: 35px;
display: flex;
justify-content: space-between;
align-items: flex-start;
position: relative;
font-size: 10.5pt;
}

.stamp-section {
position: absolute;
right: 20px;
bottom: 10px;
text-align: center;
}

.stamp-section img {
width: 90px;
height: 90px;
}
</style>
</head>
<body>

<#if !offerLetter.draft>
<div class="logo">
    <img src="${company.imageFile}" alt="Company Logo" />
  </div>
  </#if>

  <div class="content">

    <div class="title">INTERN OFFER LETTER</div>

    <p><b>Date:</b> ${offerLetter.date}</p>

    <p>
      <b>NAME:</b> ${offerLetter.employeeName}<br />
      ${offerLetter.internEmail}<br />
      ${offerLetter.mobileNo}<br />
      ${offerLetter.address}
    </p>

    <p class="section-title">Re: Internship Confirmation</p>

    <p>Dear ${offerLetter.employeeName},</p>

    <p>
      We are thrilled to offer you an internship in our <b>${offerLetter.department}</b> department at
      <b>${company.companyName}</b>, <b>${offerLetter.companyBranch}</b>. Your performance during the selection process was impressive, and we are excited to welcome you to the team.
    </p>

    <p class="section-title">Your Internship</p>

    <p>
      The internship will commence on <b>${offerLetter.startDate}</b> and end on <b>${offerLetter.endDate}</b>. You will work as a <b>${offerLetter.designation}</b>, reporting to <b>${offerLetter.associateName}</b>, <b>${offerLetter.associateDesignation}</b>, who will guide you during the period.
    </p>

    <p class="section-title">Compensation & Benefits</p>

    <p>
      You will receive a monthly stipend of <b>₹${offerLetter.stipend}/-</b> during the internship.
    </p>

    <p class="section-title">Acceptance</p>

    <p>
      Kindly sign and return this letter by <b>${offerLetter.acceptDate}</b> to confirm your acceptance. We look forward to your contribution at <b>${company.companyName}</b>.
    </p>

    <div class="signature">
      <div>
        Regards,<br />
        <b>${offerLetter.hrName}</b><br />
        Email: ${offerLetter.hrEmail}<br />
        Mobile: ${offerLetter.hrMobileNo}<br />
        Branch: ${offerLetter.companyBranch}
      </div>

      <div class="stamp-section">
        <#if !offerLetter.draft>
          <img src="${company.stampImage}" alt="Stamp" />
        <#else>
          <div style="width: 90px; height: 90px;"></div>
        </#if>
        <br />
        <b>Authorized Signature</b>
      </div>
    </div>

  </div>

</body>
</html>
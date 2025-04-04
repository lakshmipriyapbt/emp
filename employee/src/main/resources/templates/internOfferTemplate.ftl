        <#-- Internship Offer Letter Template -->

        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8"/>
            <title>Internship Offer Letter</title>
            <style>
               body {
        font-family: 'Times New Roman', serif;
        background: url('${blurredImage}') no-repeat center center;
            background-size: 60%;
            margin: 0;
            padding: 50px;
            position: relative;
        }
        .logo {
        position: absolute;
        top: 6px;
        right: 20px;
        }
        .logo img {
        max-width: 80px;
        height: auto;
        }
        .content {
        margin-top: 80px; /* create space below logo */
        background: rgba(255, 255, 255, 0.9);
        padding: 25px;
        border-radius: 10px;
        }
        .title {
        text-align: center;
        font-weight: bold;
        font-size: 18pt;
        margin-bottom: 20px;
        }
        .signature {
        margin-top: 40px;
        }
        p {
        margin: 10px 0;
        font-size: 11pt;
        }
        </style>
        </head>
        <body>

        <div class="content">
                <div class="logo">
                    <img src="${company.imageFile}" alt="Company Logo" />
                </div>

                <div class="title">OFFER LETTER INTERN</div>

                <p>Date: ${offerLetter.date}</p>

                <p><b>NAME:</b> ${offerLetter.employeeName}<br/>${offerLetter.internEmail}<br/>${offerLetter.mobileNo}<br/>${offerLetter.address}</p>

                <p><b>Re: Internship Confirmation</b></p>

                <p>Dear ${offerLetter.employeeName},</p>

                <p>
                    We are thrilled to offer you an internship in our <b>${offerLetter.department}</b> department at <b>${company.companyName}</b>,<b>${offerLetter.companyBranch}</b>. We were highly impressed with your skills during the selection process, and we are excited to welcome you to our team.
                </p>

                <p>
                    <b>Your internship</b><br/>
                    Your internship will commence on <b>${offerLetter.startDate}</b> and will conclude on <b>${offerLetter.endDate}</b>. You will be working as a <b>${offerLetter.designation}</b>. You will be directly reporting to <b>${offerLetter.associateName}</b>, <b>${offerLetter.associateDesignation}</b>, who will provide guidance and support throughout your internship.
                </p>

                <p>
                    <b>Compensation & Benefits</b><br/>
                    We are pleased to offer you a <b>₹${offerLetter.stipend}/-</b> internship stipend.
                </p>

                <p>
                    <b>Acceptance</b><br/>
                    To accept this offer, please sign and return this letter by <b>${offerLetter.acceptDate}</b>. We look forward to welcoming you to <b>${company.companyName}</b>.
                </p>

                <div class="signature" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                Regards,<br/>
                <b>${offerLetter.hrName}</b><br/>
                Email: ${offerLetter.hrEmail}<br/>
                Mobile: ${offerLetter.hrMobileNo}<br/>
                Branch: ${offerLetter.companyBranch}<br/>

            </div>
            <div style="position: absolute; right: 20px; bottom: 60px; text-align: center;">
                    <img src="${company.stampImage}" style="width: 100px; height: 100px;"/>
                    <br/>
                    <b>Authorized Signature</b>
            </div>

        </div>

</div>

        </body>
        </html>

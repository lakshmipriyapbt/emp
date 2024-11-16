import React from 'react';

const RelievingTemplate2 = ({
  companyLogo,
  companyData,
  date,
  employeeName,
  employeeId,
  designation,
  joiningDate,
  noticePeriod,
  resignationDate,
  lastWorkingDate,
}) => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
        {/* Company Logo positioned at the top right */}
        <img 
          src={companyLogo} 
          alt={`${companyData.companyName} Logo`} 
          style={{ maxWidth: '160px', position: 'absolute',top:"2px", right: '20px', height:"70px",width:"160px" }} 
        />
        <p><strong>{date}</strong></p>
        <h4 className='text-center mt-2'>Relieving Letter</h4>
              {/* Background Image (Watermark) */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '20%',
          right: '30%',
          width: '50%',
          height: '40%',
          backgroundImage: `url(${companyLogo})`, // Use the logo or another image
          transform: 'rotate(340deg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        //  filter: 'blur(2px)', // Optional: adjust blur as needed
          zIndex: 1, // Ensure it's behind the content
        }}
      />
      <div   
          style={{
          position: 'relative',
          zIndex: 2, // Bring the content in front
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: semi-transparent background for contrast
        }}>
        <p>To,</p>
        <p><strong>{employeeName}</strong></p>
        <p>Employee Id: <strong>{employeeId}</strong></p>
        <p>
          I am writing to acknowledge the resignation letter you submitted, dated <strong>{resignationDate}</strong>. I want to inform you that your resignation has been accepted, and you will be relieved from your position as an  <strong> {designation}</strong> with <strong>{companyData.companyName}</strong> on <strong>{lastWorkingDate}</strong>  with Serving the Notice Period <strong>{noticePeriod}</strong> months.
        </p>
         <p>We kindly request you to return your company ID and any other company-owned items that you have been using during your tenure with our firm.</p>
        <p>
          Your final settlement will be processed within the next 45 days.
        </p>
      
        <p>
          We deeply appreciate your valuable contributions to the company and wish you all the best in your future endeavors.
        </p>
       
        <div className='mt-5'>
        <p className='mb-5'>Best Regards,</p>
        <p className='mt-5'>Authorized Signature,</p>
        <h5 >{companyData.companyName}</h5>
        <p>{companyData.companyAddress}</p>
        <p>{companyData.cityStatePin}</p>
      </div>
      </div>
      </div>      
      );
};

export default RelievingTemplate2;

import React from 'react';

const HrCalender = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header text-white">
            <h5 className="modal-title">Event</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>Date:</strong> {event.date}</p>
            <p>Event:<strong><input type="radio" defaultChecked className={`me-1 ms-1 bg-${event.theme || 'primary'}`} />{event.title}</strong></p>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrCalender;

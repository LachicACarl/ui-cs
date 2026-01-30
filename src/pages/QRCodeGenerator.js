import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './QRCodeGenerator.css';

const QRCodeGenerator = () => {
  const employees = [
    { id: 'E001', name: 'John Smith', department: 'IT' },
    { id: 'E002', name: 'Sarah Johnson', department: 'HR' },
    { id: 'E003', name: 'Mike Davis', department: 'PM' },
    { id: 'E004', name: 'Emily Brown', department: 'Design' },
    { id: 'E005', name: 'Robert Wilson', department: 'Business' },
    { id: 'E006', name: 'Lisa Anderson', department: 'IT' },
    { id: 'E007', name: 'James Martinez', department: 'Finance' },
    { id: 'E008', name: 'Jennifer Taylor', department: 'Marketing' },
  ];

  const downloadQRCode = (id, name) => {
    const qrElement = document.getElementById(`qr-${id}`);
    const canvas = qrElement.querySelector('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${id}-${name}.png`;
    link.click();
  };

  const printAllQRCodes = () => {
    window.print();
  };

  return (
    <div className="qr-generator-container">
      <div className="qr-header">
        <h1>🔗 QR Code Generator</h1>
        <p>Print or display these QR codes for attendance scanner testing</p>
        <button className="print-btn" onClick={printAllQRCodes}>
          🖨️ Print All QR Codes
        </button>
      </div>

      <div className="qr-info-box">
        <h3>📌 How to Use:</h3>
        <ul>
          <li><strong>For Attendance Scanner:</strong> Use Employee QR Codes (E001-E008) below</li>
          <li><strong>For Login Testing:</strong> Use these credentials:
            <ul>
              <li>Admin: <code>admin</code> / <code>password123</code></li>
              <li>Manager: <code>manager</code> / <code>password123</code></li>
              <li>Employee: <code>employee</code> / <code>password123</code></li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="qr-section-title">
        <h2>👥 Employee QR Codes (Attendance Scanner)</h2>
        <p>Individual employee attendance IDs for scanning</p>
      </div>

      <div className="qr-grid">
        {employees.map((emp) => (
          <div key={emp.id} className="qr-card">
            <div className="qr-code-wrapper" id={`qr-${emp.id}`}>
              <QRCodeCanvas 
                value={emp.id} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="qr-info">
              <h3>{emp.name}</h3>
              <p className="emp-id">{emp.id}</p>
              <p className="emp-dept">{emp.department}</p>
              <button 
                className="download-btn"
                onClick={() => downloadQRCode(emp.id, emp.name)}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="qr-instructions">
        <h3>📋 Instructions:</h3>
        <ol>
          <li>Click <strong>"Print All QR Codes"</strong> to print all QR codes</li>
          <li>Or click <strong>"Download"</strong> on individual cards</li>
          <li>Display the QR code in front of your camera</li>
          <li>The scanner will automatically detect and process it</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeGenerator;

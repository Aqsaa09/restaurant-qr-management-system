import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QRTester = () => {
  const [qrCode, setQrCode] = useState('');
  const navigate = useNavigate();

  const testQRCodes = [
    { table: 'T01', qr: '57c637e4-2fb5-45df-88d3-2350c7e45693' },
    { table: 'T02', qr: '46082504-abc5-4002-b3c6-db26f65f1acf' },
    { table: 'T03', qr: 'd2bbdc5c-0286-4e7a-893c-46f91811d6ab' },
    { table: 'T04', qr: 'c142166b-5176-4ed9-85e2-465b0b2afe9a' },
    { table: 'T05', qr: '942241c9-8470-48c7-846f-ae69a2ee7a3a' }
  ];

  const generateQRURL = (qrCode) => {
    const isProduction = window.location.hostname !== 'localhost';
    if (isProduction) {
      return `https://restaurantqr-seven.vercel.app/table.html?id=${qrCode}`;
    } else {
      return `http://localhost:3001/table.html?id=${qrCode}`;
    }
  };

  const handleQRTest = (qrCode) => {
    navigate(`/table/${qrCode}`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '10px', 
      margin: '20px',
      border: '2px solid #EFD9D1'
    }}>
      <h3>🧪 QR Code Tester</h3>
      <p>Test QR codes locally without scanning:</p>
      
      <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
        {testQRCodes.map((item) => (
          <div key={item.qr} style={{ marginBottom: '10px' }}>
            <button
              onClick={() => handleQRTest(item.qr)}
              style={{
                padding: '10px 15px',
                background: '#EFD9D1',
                border: '2px solid #F4EEED',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600',
                marginRight: '10px'
              }}
            >
              Test {item.table}
            </button>
            <a
              href={generateQRURL(item.qr)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 12px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              🔗 QR Link
            </a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Manual QR Test:</h4>
        <input
          type="text"
          placeholder="Enter QR code"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            marginRight: '10px',
            width: '300px'
          }}
        />
        <button
          onClick={() => handleQRTest(qrCode)}
          disabled={!qrCode}
          style={{
            padding: '8px 16px',
            background: qrCode ? '#EFD9D1' : '#ccc',
            border: '2px solid #F4EEED',
            borderRadius: '5px',
            cursor: qrCode ? 'pointer' : 'not-allowed',
            fontWeight: '600'
          }}
        >
          Test QR
        </button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
        <p><strong>Local URLs for testing:</strong></p>
        <p>• Direct table access: <code>http://localhost:3001/table/[qr-code]</code></p>
        <p>• QR redirect: <code>http://localhost:3001/qr/[qr-code]</code></p>
      </div>
    </div>
  );
};

export default QRTester;
const express = require('express');
const pgService = require('../services/pgService');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

let inMemoryRequests = [];

// Create a service request (e.g., Call Waiter, Request Bill)
router.post('/', async (req, res) => {
  try {
    const { tableId, tableNumber, requestType, message } = req.body;

    let savedRequest;
    if (isPg()) {
      savedRequest = await pgService.createServiceRequest({
        tableId,
        tableNumber,
        requestType: requestType || 'call_waiter',
        message: message || 'Customer requested waiter assistance'
      });
    } else {
      savedRequest = {
        id: Date.now(),
        table_id: tableId,
        table_number: tableNumber || tableId || 'T01',
        request_type: requestType || 'call_waiter',
        message: message || 'Customer requested waiter assistance',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      inMemoryRequests.unshift(savedRequest);
    }

    // Emit live alert to all admin users via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('waiter-call', {
        ...savedRequest,
        notification: `🔔 Table ${savedRequest.table_number}: ${savedRequest.message}`
      });
    }

    res.status(201).json({
      message: 'Staff has been notified and is on the way to your table!',
      request: savedRequest
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all service requests
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    if (isPg()) {
      const requests = await pgService.getAllServiceRequests(status);
      return res.json(requests);
    }

    let result = [...inMemoryRequests];
    if (status && status !== 'all') {
      result = result.filter(r => r.status === status);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service request status (e.g. mark resolved/acknowledged)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (isPg()) {
      const updated = await pgService.updateServiceRequestStatus(req.params.id, status || 'resolved');
      if (!updated) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('waiter-call-resolved', updated);
      }

      return res.json(updated);
    }

    const reqItem = inMemoryRequests.find(r => r.id.toString() === req.params.id.toString());
    if (!reqItem) {
      return res.status(404).json({ message: 'Request not found' });
    }
    reqItem.status = status || 'resolved';

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('waiter-call-resolved', reqItem);
    }

    res.json(reqItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

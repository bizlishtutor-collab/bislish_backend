import express from 'express';
import {
  addContact,
  getAllContacts,
  getContactById,
  deleteContact,
} from '../controllers/contactController.js';

const router = express.Router();

// POST /api/contact
router.post('/get/add', addContact);

// GET /api/contacts
router.get('/getAll', getAllContacts);

// GET /api/contact/:id
router.get('/get/:id', getContactById);

// DELETE /api/contact/:id
router.delete('/delete/:id', deleteContact);

export default router;

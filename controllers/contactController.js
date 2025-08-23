import Contact from '../models/ContactModel.js';

// Create new contact
export const addContact = async (req, res) => {
  try {
    const { fullName, emailAddress, subject, message } = req.body;

    // Validation
    if (!fullName || !emailAddress || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Create and save contact
    const contact = new Contact({ fullName, emailAddress, subject, message });
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact added successfully.',
      contact,
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Get all contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Get contact by ID
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Delete contact by ID
export const deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully.',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

# Backend Setup Instructions

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/tutor_web
# or
MONGODB_URI=mongodb://localhost:27017/tutor_web

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Port
PORT=8000

# Node Environment
NODE_ENV=development
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

## Course Creation Issues Fixed

The following issues have been resolved:

1. **Authentication Header Format**: Fixed the `getAuthHeaders()` function to return proper `Authorization: Bearer <token>` format
2. **Missing State Variables**: Added missing `isVideoDialogOpen` state
3. **Form Validation**: Added proper validation for required fields and date ranges
4. **Error Handling**: Improved error handling and user feedback
5. **Database Connection**: Fixed MongoDB connection configuration
6. **File Upload**: Ensured proper FormData handling for file uploads

## Testing Course Creation

To test if course creation is working:

1. Make sure MongoDB is running
2. Start the backend server
3. Login as admin in the frontend
4. Try creating a course with all required fields
5. Check the browser console and server logs for any errors

## Required Fields for Course Creation

- Title
- Description  
- Category (IELTS, English Proficiency, or Quran)
- Syllabus
- Instructor Name
- Start Date
- End Date

Optional fields:
- Video file
- Image file
- Features (array)
- Tags (array)
- Requirements (array)
- Learning Outcomes (array)
- Status (active, inactive, upcoming)
- Level (beginner, intermediate, advanced) 
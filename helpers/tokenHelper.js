import JWT from 'jsonwebtoken';

// Generate JWT Token with very long expiration (1 year)
export const generateToken = async (user) => {
    return JWT.sign(
        { _id: user._id, role: user.role, name: user.name, email: user.email },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '365d' } // 1 year expiration instead of 7 days
    );
};

// Generate refresh token for persistent sessions
export const generateRefreshToken = async (user) => {
    return JWT.sign(
        { _id: user._id, role: user.role, name: user.name, email: user.email, type: 'refresh' },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '365d' } // 1 year expiration
    );
};

// Verify token without expiration check for persistent sessions
export const verifyTokenPersistent = (token) => {
    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        return { valid: true, decoded };
    } catch (error) {
        // Only return invalid if it's a malformed token, not if it's expired
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, error: 'Invalid token' };
        }
        // For expired tokens, we still consider them valid for persistent sessions
        if (error.name === 'TokenExpiredError') {
            return { valid: true, decoded: JWT.decode(token), expired: true };
        }
        return { valid: false, error: error.message };
    }
};

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a random string for password reset
const generateResetCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if verification code is expired
const isCodeExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

module.exports = {
  generateVerificationCode,
  generateResetCode,
  isCodeExpired
};
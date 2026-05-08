let BASE_URL;
if (window.origin.includes("localhost")) {
  BASE_URL = "http://localhost:8000";
} else {
  BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://chainwill.pinerockcreditunion.com";
}

// router.post('/notifications/email', notificationRateLimit, sendNotificationEmail);
// router.post('/otp/send', otpRateLimit, sendOtp);
// router.post('/otp/verify', verifyOtp);

export const ApiLayer = {
  communication: `${BASE_URL}/api/communication`,
  will: `${BASE_URL}/will`,
  user: `${BASE_URL}/user`,
};

export const Api_Endpoints = {
  sendNotificationEmail: `${ApiLayer.communication}/notifications/email`,
  sendOtp: `${ApiLayer.communication}/otp/send`,
  verifyOtp: `${ApiLayer.communication}/otp/verify`,
};

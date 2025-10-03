// src/lib/payment.ts

export function openRazorpayCheckout(amountInPaise: number, onSuccess: (response: any) => void) {
  // Placeholder Razorpay integration function
  // Add Razorpay script in your `index.html` or dynamically load it before using this

  if (!(window as any).Razorpay) {
    alert("Razorpay SDK is not loaded. Please add Razorpay script.");
    return;
  }

  const options = {
    key: "YOUR_RAZORPAY_KEY_HERE", // Replace with your Razorpay key
    amount: amountInPaise,
    currency: "INR",
    name: "TutorMitra",
    description: "Booking Payment",
    handler: (response: any) => {
      onSuccess(response);
    },
    prefill: {
      email: "",
      contact: "",
    },
    theme: {
      color: "#3399cc",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}

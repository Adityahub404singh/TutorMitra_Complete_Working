interface BookingState {
  tutorName: string;
  date: string;
  time: string;
  sessionType?: string;
  amount?: number;
  amountPaid?: number;
  isTrial?: boolean;
  paymentStatus?: "pending" | "success" | "failed"; // backend se aayega
}

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as BookingState | undefined;

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-700 text-center text-lg">
          No booking information found. Please make a booking first.
        </p>
      </div>
    );
  }

  const { tutorName, date, time, sessionType, isTrial, paymentStatus } = state;
  const amount = state.amount ?? state.amountPaid ?? 0;
  const session = sessionType ?? "1-on-1";

  // Payment confirmation check
  let displayAmount = 0;
  let paymentMessage = "";

  if (isTrial) {
    paymentMessage = "Trial session - no payment required";
  } else if (paymentStatus === "success") {
    displayAmount = amount;
    paymentMessage = `Amount Paid: ₹${displayAmount}`;
  } else {
    paymentMessage = "Payment pending. Please complete the payment.";
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-200 to-green-400 p-6">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 text-center">
        <svg
          aria-hidden="true"
          className="mx-auto h-20 w-20 text-green-600 mb-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5 7a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-4xl font-extrabold text-green-700 mb-6">
          Booking Confirmed!
        </h1>
        <p className="text-gray-800 mb-4 text-lg">
          You have successfully booked a session with{" "}
          <span className="font-semibold">{tutorName}</span>.
        </p>
        <div className="text-gray-700 space-y-2 text-base">
          <p>
            <strong>Date:</strong> {date}
          </p>
          <p>
            <strong>Time:</strong> {time}
          </p>
          <p>
            <strong>Session Type:</strong> {session}
          </p>
          <p className="mt-4 text-xl font-bold">{paymentMessage}</p>
        </div>
        <button
          onClick={() => navigate("/student-home")}
          className="mt-8 w-full py-3 rounded bg-green-600 text-white text-lg font-semibold hover:bg-green-700 transition"
          aria-label="Back to Dashboard"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}


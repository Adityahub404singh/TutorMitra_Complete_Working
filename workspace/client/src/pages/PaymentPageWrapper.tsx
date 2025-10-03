import React from "react";
import { useParams } from "react-router-dom";
import PaymentPage from "./Payment"; // Adjust path if your file or folder is different

export default function PaymentPageWrapper() {
  const { bookingId } = useParams<{ bookingId: string }>();
  if (!bookingId) {
    return <div className="text-center p-6 text-red-600 font-bold">Booking ID missing from URL</div>;
  }
  return <PaymentPage bookingId={bookingId} />;
}

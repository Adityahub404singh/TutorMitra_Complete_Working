import GoogleIcon from "@/assets/google.svg";
import PhoneIcon from "@/assets/phone.svg";

function SocialButtons() {
  return (
    <>
      <button className="btn-google">
        <GoogleIcon className="w-6 h-6 mr-2" />
        Continue with Google
      </button>
      <button className="btn-phone">
        <PhoneIcon className="w-6 h-6 mr-2" />
        Continue with Phone
      </button>
    </>
  );
}

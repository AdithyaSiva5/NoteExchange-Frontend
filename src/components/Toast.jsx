// toast.js
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let lastToastId = null;
let lastToastMessage = null;
let lastToastTimestamp = 0;

// Return null to disable rendering
export const ToastContainerWrapper = ({ theme }) => null; // Or return <></>

// Keep ColoredToast but make it do nothing
export const ColoredToast = (message, type = "default") => {
  // Log to console instead of showing toast (optional)
  console.log(`${type}: ${message}`);
  return; // Exit early, no toast shown
};

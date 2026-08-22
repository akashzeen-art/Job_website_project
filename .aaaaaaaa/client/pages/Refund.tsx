import Navbar from "@/components/Navbar";
import VideoBackground from "@/components/VideoBackground";
import { Link } from "react-router-dom";
import { useQueryParams } from "@/hooks/use-query-params";

export default function Refund() {
  const queryParams = useQueryParams();
  return (
    <div className="relative min-h-screen bg-sexy-cooking-cream">
      <VideoBackground />
      
      <div className="relative z-20">
        <Navbar />
        
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
            <p className="text-sm mb-8">Last Updated: 09-07-2025</p>
            
            <div className="space-y-6 text-sm leading-relaxed">
              <p>Thank you for subscribing to EYoga's services. We hope you are satisfied with our services, but if not, we're here to help.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Free Trial</h2>
              <p>EYoga offers no free trial for new users to experience the services before purchasing a subscription. During the trial period, users can cancel their subscription at any time without being charged.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">2. Cancellation Policy</h2>
              <p>Subscribers may cancel their recurring subscription at any time. Upon cancellation, your account will remain active until the end of your current billing cycle.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">3. Refund Eligibility</h2>
              <p>To be eligible for a refund, you must submit a request within 2 days of your subscription start date. Refunds may be considered on a case-by-case basis and are granted at the sole discretion of EYoga.</p>
              <p className="mt-4">Refund requests can be made if you encounter technical issues that prevent you from using our service and that cannot be resolved by our support team. Proof of the issue may be required.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Process for Requesting a Refund</h2>
              <p>To request a refund, please contact our customer support team at <a href="tel:+919667687077" className="text-red-400 hover:text-red-300">+91 8929836907</a>. Include your account information, subscription details, and a brief explanation of why you are requesting a refund.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">5. Refund Processing</h2>
              <p>Once your refund request is received and inspected, we will send you an email to notify you of the approval or rejection of your refund.</p>
              <p className="mt-4">If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7 working days.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">Scenarios Where Refunds Would Typically Be Granted:</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Technical Issues:</strong> The customer experiences persistent technical issues that prevent them from using the product effectively.</li>
                <li><strong>Billing Error:</strong> The customer was incorrectly charged due to a billing error on EYoga's part.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">Scenarios Where Refunds Would Not Typically Be Granted:</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Change of Mind:</strong> The customer decides they no longer want or need the product after the refund eligibility period has passed.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
              <p>If you have any questions about our refund policy, please contact us at <a href="tel:+919667687077" className="text-red-400 hover:text-red-300">+91 8929836907</a>.</p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <Link to={`/${queryParams}`} className="text-red-400 hover:text-red-300">← Back to Home</Link>
            </div>
          </div>
        </div>
        
        <footer className="border-t border-white/20 bg-white/10 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center text-white text-sm">
            <p className="mb-2">&copy; 2025, EYoga All Rights Reserved</p>

          </div>
        </footer>
      </div>
    </div>
  );
}

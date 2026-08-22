import Navbar from "@/components/Navbar";
import VideoBackground from "@/components/VideoBackground";
import { Link } from "react-router-dom";
import { useQueryParams } from "@/hooks/use-query-params";

export default function Privacy() {
  const queryParams = useQueryParams();
  return (
    <div className="relative min-h-screen bg-sexy-cooking-cream">
      <VideoBackground />
      
      <div className="relative z-20">
        <Navbar />
        
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-sm mb-8">Last Updated: 14-07-2025</p>
            
            <div className="space-y-6 text-sm leading-relaxed">
              <p>This Privacy Policy describes how EYoga ("we", "us", or "our") collects, uses, discloses, and protects your personal information when you visit or make a purchase from EYoga (the "Site") or use any of our services (collectively, the "Services").</p>
              
              <p>By using our Services, you agree to the collection and use of information as outlined in this Privacy Policy. If you do not agree, please do not use the Services.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-bold mt-6 mb-3">a) Information You Provide Directly</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact details: Name, phone number, email address, postal address</li>
                <li>Order details: Product purchase history, billing/shipping information</li>
                <li>Account information: Login credentials, preferences</li>
                <li>Customer support queries and feedback</li>
              </ul>
              
              <h3 className="text-xl font-bold mt-6 mb-3">b) Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Pages visited, time spent, and referring URLs</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill orders</li>
                <li>Communicate with you about orders, updates, or issues</li>
                <li>Improve the functionality and user experience of the website</li>
                <li>Respond to inquiries and provide customer support</li>
                <li>Send promotional emails, newsletters, and marketing offers (you can opt out anytime)</li>
                <li>Monitor and prevent fraudulent transactions and abuse of our Services</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Share Your Information</h2>
              <p>Your personal information may be shared only in limited circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>With service providers such as payment processors, hosting providers, and email service platforms</li>
                <li>With business partners to conduct joint promotions or events (only with your consent)</li>
                <li>With legal authorities where required by law</li>
                <li>With affiliates or during business restructuring, such as mergers or acquisitions</li>
              </ul>
              <p className="mt-4">We do not sell your personal information. We do not share sensitive personal information for targeted advertising purposes.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies and Tracking Technologies</h2>
              <p>Cookies help us provide, protect, and improve our services. You can manage or disable cookies in your browser settings. However, disabling cookies may affect certain features or functionalities of the website.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">9. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Access and update your personal information</li>
                <li>Delete your data</li>
                <li>Opt out of marketing communications</li>
                <li>Restrict or object to certain data processing</li>
                <li>Request data portability</li>
              </ul>
              
              <p className="mt-6">To make any such request, please contact us at:</p>
              <p className="mt-2">📞 <a href="tel:+919667687077" className="text-red-400 hover:text-red-300">+91 8929836907</a></p>
              <p>📍 Sector 54, Gurgaon, Haryana, 122011</p>
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

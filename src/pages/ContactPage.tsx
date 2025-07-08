import React from 'react';

const ContactPage: React.FC = () => (
  <div className="container-custom py-16">
    <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
    <p className="text-gray-700 mb-6">You can reach us via the form below for any questions or support requests.</p>
    <form className="max-w-lg space-y-4">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input type="text" className="input-field w-full" placeholder="Your Name" />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input type="email" className="input-field w-full" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block mb-1 font-medium">Message</label>
        <textarea className="input-field w-full" rows={4} placeholder="Your message..." />
      </div>
      <button type="submit" className="btn-primary px-6 py-2">Send</button>
    </form>
  </div>
);

export default ContactPage; 
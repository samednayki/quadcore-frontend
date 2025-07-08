import React from 'react';

const FAQPage: React.FC = () => (
  <div className="container-custom py-16">
    <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold">How can I make a reservation?</h2>
        <p className="text-gray-700">You can search for hotels and complete your reservation online through our platform.</p>
      </div>
      <div>
        <h2 className="font-semibold">Can I cancel my reservation?</h2>
        <p className="text-gray-700">Yes, you can cancel your reservation from your account page or by contacting support, depending on the hotel's cancellation policy.</p>
      </div>
      <div>
        <h2 className="font-semibold">How do I contact customer support?</h2>
        <p className="text-gray-700">You can use the Contact Us page to send us a message or check the Help Center for more information.</p>
      </div>
    </div>
  </div>
);

export default FAQPage; 
import React from 'react';

const faqs = [
  {
    question: 'How can I make my reservation?',
      answer: 'You can make a reservation by using the search form on the home page, then follow the steps to complete your reservation.'
    },
  {
    question: 'How can I cancel my reservation?',
    answer: 'You can cancel your reservation by selecting the relevant reservation in the My Reservations section of your account.'
  },
  {
    question: 'What are the payment methods?',
    answer: 'Credit card, bank card and some hotels offer payment methods at the arrival.'
  },
  {
    question: 'How can I contact the support team?',
    answer: 'You can contact us through the contact information below or use the live support window.'
  },
];

const HelpCenterPage: React.FC = () => (
  <div className="container-custom py-16 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Help Center</h1>
    <p className="text-gray-700 mb-8">Find answers to common questions and get support for your reservations.</p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-1">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      <ul className="text-gray-700 space-y-2">
        <li><span className="font-medium">E-mail:</span> support@quadcore.com</li>
        <li><span className="font-medium">Phone:</span> +90 555 123 45 67</li>
        <li><span className="font-medium">Live Support:</span> You can use the live support window on the bottom right.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-4">Quick Help</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>To see the reservation steps, click <span className="text-blue-600 underline cursor-pointer">here</span>.</li>
        <li>To see the cancellation and refund policies, click <span className="text-blue-600 underline cursor-pointer">here</span>.</li>
        <li>To see the payment methods, click <span className="text-blue-600 underline cursor-pointer">here</span>.</li>
      </ul>
    </section>
  </div>
);

export default HelpCenterPage; 
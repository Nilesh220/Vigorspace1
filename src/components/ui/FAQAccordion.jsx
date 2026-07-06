import { useState } from 'react';
import { Plus } from 'lucide-react';

const faqData = [
  {
    question: 'How do I earn rewards points?',
    answer: 'You can earn rewards points by completing tasks, attending events, referring friends, and participating in community activities. Each activity has its own point value.'
  },
  {
    question: 'Can I redeem points for cash?',
    answer: 'Yes! You can redeem your points for cash via PayPal or for gift cards from popular brands like Amazon, Myntra, Netflix, Spotify, and more.'
  },
  {
    question: 'How do I join events?',
    answer: 'Browse the Events page to see upcoming events. Click "KNOW MORE" for details and "BOOK" to register. Some events may require a minimum point balance.'
  },
  {
    question: 'How quickly are points credited?',
    answer: 'Points are typically credited within 24-48 hours after task verification. Some instant tasks credit points immediately upon completion.'
  },
  {
    question: 'Can I connect with others?',
    answer: 'Absolutely! Join our WhatsApp community, participate in events, and connect with fellow students through the platform. Collaboration is at the heart of Vigor Space.'
  },
  {
    question: 'What happens after I submit a task?',
    answer: 'After submission, our team reviews your proof of completion. Once approved, points are credited to your account. You\'ll receive a notification about the status.'
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="faq-section">
      {faqData.map((item, index) => (
        <div
          key={index}
          className={`faq-item ${openIndex === index ? 'open' : ''}`}
        >
          <button
            className="faq-question"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span>{item.question}</span>
            <span className="faq-icon">
              <Plus size={14} />
            </span>
          </button>
          <div className="faq-answer">
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

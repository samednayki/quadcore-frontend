import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Guest } from '../../types';
import { formatPrice, isValidEmail, formatPhoneNumber } from '../../utils';

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    guests: [] as Guest[],
    specialRequests: '',
    paymentMethod: 'credit-card',
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Mock otel ve oda bilgileri
  const hotelInfo = {
    name: 'Grand Hotel İstanbul',
    roomName: 'Deluxe Oda',
    checkIn: new Date('2024-06-15'),
    checkOut: new Date('2024-06-18'),
    totalPrice: { amount: 5400, currency: 'TRY' as const },
    nights: 3,
  };

  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const newGuests = [...formData.guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setFormData(prev => ({ ...prev, guests: newGuests }));
  };

  const addGuest = () => {
    const newGuest: Guest = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'adult',
    };
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, newGuest]
    }));
  };

  const removeGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (formData.guests.length === 0) {
      newErrors.push('At least one guest information is required');
    }

    formData.guests.forEach((guest, index) => {
      if (!guest.firstName.trim()) {
        newErrors.push(`Guest ${index + 1}: First name is required`);
      }
      if (!guest.lastName.trim()) {
        newErrors.push(`Guest ${index + 1}: Last name is required`);
      }
      if (!guest.email.trim()) {
        newErrors.push(`Guest ${index + 1}: Email is required`);
      } else if (!isValidEmail(guest.email)) {
        newErrors.push(`Guest ${index + 1}: Please enter a valid email address`);
      }
      if (!guest.phone.trim()) {
        newErrors.push(`Guest ${index + 1}: Phone is required`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    // Rezervasyon işlemi
    console.log('Reservation is being completed:', formData);
    
    // Mock rezervasyon numarası
    const reservationNumber = 'RES' + Date.now().toString().slice(-8);
    
    // Başarılı rezervasyon sayfasına yönlendir
    navigate('/reservation-success', { 
      state: { 
        reservationNumber,
        hotelInfo,
        formData 
      } 
    });
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Reservation
          </h1>
          <p className="text-gray-600">
            Step {step} / 2
          </p>
        </div>

        {/* Adım göstergesi */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana form */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Guest Information
                </h2>

                {/* Hata mesajları */}
                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <ul className="text-red-600 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Misafir listesi */}
                <div className="space-y-6">
                  {formData.guests.map((guest, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">
                          Guest {index + 1}
                        </h3>
                        {formData.guests.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGuest(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={guest.firstName}
                            onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={guest.lastName}
                            onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={guest.email}
                            onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon *
                          </label>
                          <input
                            type="tel"
                            value={guest.phone}
                            onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addGuest}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    + Add Guest
                  </button>
                </div>

                {/* Özel istekler */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="input-field"
                    placeholder="You can write your special requests here..."
                  />
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleNext}
                    className="w-full btn-primary py-3"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Payment Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="input-field"
                    >
                          <option value="credit-card">Credit Card</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV Code
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="Ad Soyad"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 btn-primary"
                  >
                    Complete Reservation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Özet */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reservation Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{hotelInfo.name}</h4>
                  <p className="text-sm text-gray-600">{hotelInfo.roomName}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Check-in:</span>
                    <span>{hotelInfo.checkIn.toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-out:</span>
                    <span>{hotelInfo.checkOut.toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Night:</span>
                    <span>{hotelInfo.nights}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-lg text-primary-600">
                      {formatPrice(hotelInfo.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage; 
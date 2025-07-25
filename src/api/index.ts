export {};

// BeginTransaction Types
export interface BeginTransactionRequest {
  offerIds: string[];
  currency: string;
  culture: string;
}

export interface BeginTransactionResponse {
  header: {
    requestId: string;
    success: boolean;
    responseTime: string;
    messages: Array<{
      id: number;
      code: string;
      messageType: number;
      message: string;
    }>;
  };
  body: {
    transactionId: string;
    expiresOn: string;
    reservationData: {
      travellers: Traveller[];
      reservationInfo: ReservationInfo;
      services: Service[];
      paymentDetail: PaymentDetail;
      invoices: any[];
    };
    status: number;
    transactionType: number;
  };
}

export interface Traveller {
  travellerId: string;
  type: number;
  title: number;
  availableTitles: Title[];
  availableAcademicTitles: AcademicTitle[];
  academicTitle?: AcademicTitle;
  isLeader: boolean;
  birthDate: string;
  nationality: {
    twoLetterCode: string;
  };
  identityNumber: string;
  passportInfo: {
    expireDate: string;
    issueDate: string;
    citizenshipCountryCode: string;
  };
  address: {
    contactPhone?: any;
    phone?: string;
    email: string;
    address: string;
    zipCode: string;
    city: {
      id: string;
      name: string;
    };
    country: {
      id: string;
      name: string;
    };
  };
  destinationAddress: any;
  services: TravellerService[];
  orderNumber: number;
  birthDateFrom: string;
  birthDateTo: string;
  requiredFields: string[];
  documents: any[];
  passengerType: number;
  additionalFields: {
    travellerTypeOrder: string;
    travellerUniqueID: string;
    tourVisio_TravellerId: string;
    paximum_TravellerId: string;
    birthDateFrom: string;
    birthDateTo: string;
  };
  insertFields: any[];
  status: number;
}

export interface Title {
  id: string;
  name: string;
}

export interface AcademicTitle {
  id: string;
  name: string;
}

export interface TravellerService {
  id: string;
  type: number;
  price: {
    amount: number;
    currency: string;
  };
  passengerType: number;
}

export interface ReservationInfo {
  bookingNumber: string;
  agency: Agency;
  agencyUser: AgencyUser;
  beginDate: string;
  endDate: string;
  note: string;
  salePrice: Price;
  supplementDiscount: Price;
  passengerEB: Price;
  agencyEB: Price;
  passengerAmountToPay: Price;
  agencyAmountToPay: Price;
  discount: Price;
  agencyBalance: Price;
  passengerBalance: Price;
  agencyCommission: Price;
  brokerCommission: Price;
  agencySupplementCommission: Price;
  promotionAmount: Price;
  priceToPay: Price;
  agencyPriceToPay: Price;
  passengerPriceToPay: Price;
  totalPrice: Price;
  reservationStatus: number;
  confirmationStatus: number;
  paymentStatus: number;
  documents: any[];
  otherDocuments: any[];
  reservableInfo: {
    reservable: boolean;
  };
  paymentFrom: number;
  departureCountry: Country;
  departureCity: City;
  arrivalCountry: Country;
  arrivalCity: City;
  createDate: string;
  additionalFields: {
    smsLimit: string;
    priceChanged: string;
    allowSalePriceEdit: string;
    sendFlightSms: string;
  };
  additionalCode1: string;
  additionalCode2: string;
  additionalCode3: string;
  additionalCode4: string;
  agencyDiscount: number;
  hasAvailablePromotionCode: boolean;
}

export interface Agency {
  code: string;
  name: string;
  country: Country;
  address: AgencyAddress;
  ownAgency: boolean;
  aceExport: boolean;
}

export interface AgencyAddress {
  country: Country;
  city: City;
  addressLines: string[];
  zipCode: string;
  email: string;
  phone: string;
  address: string;
}

export interface AgencyUser {
  office: {
    code: string;
    name: string;
  };
  operator: {
    code: string;
    name: string;
    agencyCanDiscountCommission: boolean;
  };
  market: {
    code: string;
    name: string;
  };
  agency: {
    code: string;
    name: string;
    ownAgency: boolean;
    aceExport: boolean;
  };
  name: string;
  code: string;
}

export interface Country {
  code: string;
  internationalCode: string;
  name: string;
  type: number;
  latitude: string;
  longitude: string;
  parentId: string;
  countryId: string;
  provider: number;
  isTopRegion: boolean;
  id: string;
}

export interface City {
  code: string;
  name: string;
  type: number;
  latitude: string;
  longitude: string;
  parentId: string;
  countryId: string;
  provider: number;
  isTopRegion: boolean;
  id: string;
}

export interface Price {
  amount: number;
  currency: string;
  percent?: number;
}

export interface Service {
  orderNumber: number;
  note: string;
  departureCountry: Country;
  departureCity: City;
  arrivalCountry: Country;
  arrivalCity: City;
  serviceDetails: ServiceDetails;
  partnerServiceId: string;
  isMainService: boolean;
  isRefundable: boolean;
  bundle: boolean;
  cancellationPolicies: CancellationPolicy[];
  documents: any[];
  encryptedServiceNumber: string;
  priceBreakDowns: any[];
  commission: number;
  reservableInfo: {
    reservable: boolean;
  };
  unit: number;
  conditionalSpos: any[];
  confirmationStatus: number;
  serviceStatus: number;
  productType: number;
  createServiceTypeIfNotExists: boolean;
  id: string;
  code: string;
  name: string;
  beginDate: string;
  endDate: string;
  adult: number;
  child: number;
  infant: number;
  price: Price;
  includePackage: boolean;
  compulsory: boolean;
  isExtraService: boolean;
  provider: number;
  travellers: string[];
  thirdPartyRecord: boolean;
  recordId: number;
  additionalFields: {
    isRefundable: string;
    reservableInfo: string;
    isEditable: string;
  };
}

export interface ServiceDetails {
  serviceId: string;
  thumbnail: string;
  hotelDetail: HotelDetail;
  night: number;
  room: string;
  board: string;
  accom: string;
  geoLocation: {
    longitude: string;
    latitude: string;
  };
}

export interface HotelDetail {
  address: {
    addressLines: any[];
  };
  transferLocation: City;
  stopSaleGuaranteed: number;
  stopSaleStandart: number;
  geolocation: {
    longitude: string;
    latitude: string;
  };
  location: City;
  country: Country;
  city: City;
  thumbnail: string;
  id: string;
  name: string;
}

export interface CancellationPolicy {
  beginDate: string;
  dueDate: string;
  price: Price;
  provider: number;
}

export interface PaymentDetail {
  paymentPlan: PaymentPlan[];
  paymentInfo: any[];
}

export interface PaymentPlan {
  paymentNo: number;
  dueDate: string;
  price: Price;
  paymentStatus: boolean;
}

export async function getOffers({
  token,
  searchId,
  offerId,
  productId,
  productType,
  currency,
  culture = "tr-TR",
  getRoomInfo = true
}: {
  token: string;
  searchId: string;
  offerId: string;
  productId: string;
  productType: number;
  currency: string;
  culture?: string;
  getRoomInfo?: boolean;
}) {
  const response = await fetch("http://localhost:8080/api/getoffers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      searchId,
      offerId,
      productType,
      productId,
      currency,
      culture,
      getRoomInfo
    })
  });
  if (!response.ok) throw new Error("Teklif detayları alınamadı");
  return response.json();
}

export async function getOfferDetails({
  token,
  offerIds,
  currency,
  getProductInfo = false
}: {
  token: string;
  offerIds: string[];
  currency: string;
  getProductInfo?: boolean;
}) {
  const response = await fetch("http://localhost:8080/api/getofferdetails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      offerIds,
      currency,
      getProductInfo
    })
  });
  if (!response.ok) throw new Error("Offer details could not be fetched");
  return response.json();
}

export async function beginTransaction({
  token,
  offerIds,
  currency,
  culture = "en-US"
}: {
  token: string;
  offerIds: string[];
  currency: string;
  culture?: string;
}): Promise<BeginTransactionResponse> {
  
  const requestBody = {
    offerIds,
    currency,
    culture
  };
  
  console.log('BeginTransaction Request URL:', "http://localhost:8080/api/begintransaction");
  console.log('BeginTransaction Request Body:', requestBody);
  console.log('BeginTransaction Request Headers:', {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token.substring(0, 20)}...`
  });
  
  const response = await fetch("http://localhost:8080/api/begintransaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('BeginTransaction Response Status:', response.status);
  console.log('BeginTransaction Response Status Text:', response.statusText);
  console.log('BeginTransaction Response Headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('BeginTransaction Error Response:', errorText);
    throw new Error(`Transaction başlatılamadı: ${response.status} ${response.statusText}`);
  }
  
  // Check if response has content
  const responseText = await response.text();
  console.log('BeginTransaction Raw Response Length:', responseText.length);
  console.log('BeginTransaction Raw Response:', responseText);
  
  if (!responseText || responseText.trim() === '') {
    throw new Error("API'den boş response geldi");
  }
  
  try {
    const jsonData = JSON.parse(responseText);
    console.log('BeginTransaction Parsed JSON:', jsonData);
    return jsonData;
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    console.error('Response Text:', responseText);
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
    throw new Error(`JSON parse hatası: ${errorMessage}`);
  }
}

// SetReservationInfo Types
export interface SetReservationInfoRequest {
  transactionId: string;
  agencyReservationNumber?: string;
  reservationNote?: string;
  customerInfo: CustomerInfo;
  travellers: Traveller[];
}

export interface CustomerInfo {
  isCompany: boolean;
  passportInfo: PassportInfo;
  address: Address;
  taxInfo: TaxInfo;
  title: number;
  name: string;
  surname: string;
  birthDate: string;
  identityNumber: string;
  updateIfExists?: boolean;
  updateOnlyNullFields?: boolean;
  isDefault?: boolean;
  id?: string;
}

export interface PassportInfo {
  serial?: string;
  number?: string;
  expireDate?: string;
  issueDate?: string;
  citizenshipCountryCode?: string;
}

export interface Address {
  phone?: string;
  email?: string;
  address?: string;
  zipCode?: string;
  city?: any;
  country?: any;
  addressLines?: string[];
}

export interface TaxInfo {
  taxOffice?: string;
  taxNumber?: string;
}

export interface SetReservationInfoResponse {
  body: any;
  header: any;
}

export async function setReservationInfo({
  token,
  data
}: {
  token: string;
  data: SetReservationInfoRequest;
}): Promise<SetReservationInfoResponse> {
  const response = await fetch("http://localhost:8080/api/setreservationinfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Rezervasyon bilgisi kaydedilemedi");
  return response.json();
}

// CommitTransaction Types
export interface CommitTransactionRequest {
  transactionId: string;
}

export interface CommitTransactionResponse {
  body: {
    reservationNumber: string;
    encryptedReservationNumber: string;
    transactionId: string;
  };
  header: any;
}

export async function commitTransaction({
  token,
  data
}: {
  token: string;
  data: CommitTransactionRequest;
}): Promise<CommitTransactionResponse> {
  const response = await fetch("http://localhost:8080/api/committransaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Rezervasyon tamamlanamadı");
  return response.json();
}

export async function getReservationList({ token, dateCriteria, culture = 'en-US' }: {
  token: string;
  dateCriteria: Array<{ type: number; from: string; to: string }>;
  culture?: string;
}) {
  const requestBody = {
    dateCriterias: dateCriteria, // <-- büyük C ve s ile!
    culture
  };
  const response = await fetch('http://localhost:8080/api/getreservationlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) throw new Error('Failed to fetch reservations');
  const text = await response.text();
  if (!text) return { body: { reservations: [] } };
  return JSON.parse(text);
}

export async function getReservationDetail({ token, reservationNumber }: { token: string; reservationNumber: string }) {
  const response = await fetch('http://localhost:8080/api/getreservationdetail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reservationNumber })
  });
  if (!response.ok) throw new Error('Failed to fetch reservation detail');
  const text = await response.text();
  if (!text) return {};
  return JSON.parse(text);
}

export async function getNationality() {
  const response = await fetch("http://localhost:8080/api/nationalities", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) throw new Error("Nationality listesi alınamadı");
  return response.json();
}

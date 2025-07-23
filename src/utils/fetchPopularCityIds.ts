// Bu script popüler şehirlerin backend id ve type'larını autocomplete endpointinden çeker.
// Çalıştırmak için: ts-node veya node ile derleyip çalıştırabilirsin (fetch polyfill gerekebilir).

const popularCityNames = [
  'Antalya',
  'Bodrum',
  'İstanbul',
  'İzmir',
  'Paris',
  'Roma',
  'Barcelona',
  'Amsterdam',
  'Prag',
  'Londra',
];

const AUTOCOMPLETE_URL = 'http://localhost:8080/api/autocomplete'; // Gerekirse endpointi güncelle
const AUTH_TOKEN = localStorage.getItem('authToken') || '';

async function fetchCityId(cityName: string) {
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({ query: cityName, type: 2 }), // type: 2 şehir için
  });
  if (!response.ok) {
    console.error(`${cityName} için istek başarısız:`, response.statusText);
    return null;
  }
  const data = await response.json();
  // Şehirle tam eşleşen ilk sonucu bul
  const match = (data.body?.cities || []).find((c: any) => c.name.toLowerCase() === cityName.toLowerCase());
  if (match) {
    return { id: match.id, name: match.name, type: match.type };
  } else {
    console.warn(`${cityName} için tam eşleşen şehir bulunamadı.`);
    return null;
  }
}

async function main() {
  const results = [];
  for (const city of popularCityNames) {
    const info = await fetchCityId(city);
    if (info) results.push(info);
  }
  console.log('Popüler şehirlerin backend id ve type bilgileri:');
  console.log(JSON.stringify(results, null, 2));
}

main(); 
export {}; 
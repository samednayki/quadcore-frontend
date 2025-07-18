export {};

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

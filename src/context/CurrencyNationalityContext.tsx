import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Currency {
  code: string;
  name: string;
}
export interface Nationality {
  id: string;
  name: string;
}

interface CurrencyNationalityContextType {
  currency: string;
  setCurrency: (val: string) => void;
  currencyList: Currency[];
  setCurrencyList: (list: Currency[]) => void;
  nationality: string;
  setNationality: (val: string) => void;
  nationalityList: Nationality[];
  setNationalityList: (list: Nationality[]) => void;
}

const CurrencyNationalityContext = createContext<CurrencyNationalityContextType | undefined>(undefined);

export const useCurrencyNationality = () => {
  const ctx = useContext(CurrencyNationalityContext);
  if (!ctx) throw new Error('useCurrencyNationality must be used within a CurrencyNationalityProvider');
  return ctx;
};

export const CurrencyNationalityProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState('');
  const [currencyList, setCurrencyList] = useState<Currency[]>([]);
  const [nationality, setNationality] = useState('');
  const [nationalityList, setNationalityList] = useState<Nationality[]>([]);

  return (
    <CurrencyNationalityContext.Provider value={{
      currency, setCurrency, currencyList, setCurrencyList,
      nationality, setNationality, nationalityList, setNationalityList
    }}>
      {children}
    </CurrencyNationalityContext.Provider>
  );
}; 
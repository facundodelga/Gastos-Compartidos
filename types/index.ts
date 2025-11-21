export interface Member {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  baseCurrency: string;
  members: Member[];
  createdAt: string;
  ownerId: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  amountInBaseCurrency: number;
  paidBy: string;
  participants: string[];
  category: string;
  date: string;
}

export interface Balance {
  memberId: string;
  memberName: string;
  paid: number;
  shouldPay: number;
  balance: number;
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: {
    [key: string]: number;
  };
}

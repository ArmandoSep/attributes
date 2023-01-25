export interface Product {
  //id: number;
  address: string;
  date_submitted: string;
  deal_type: string;
  deal_status: string;
  last_activity_date: string;
  source_type: string;
  clarification_url: string;
  name: string;
  email: string;
}

const enum Category {
  Electronics = 'electronics',
  Jewelery = 'jewelery',
  MenSClothing = "men's clothing",
  WomenSClothing = "women's clothing",
}

interface Rating {
  rate: number;
  count: number;
}

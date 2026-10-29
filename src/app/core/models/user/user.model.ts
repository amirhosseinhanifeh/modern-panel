export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase:string,
    bs:string
  };
  address:{

  }
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface HttpState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}
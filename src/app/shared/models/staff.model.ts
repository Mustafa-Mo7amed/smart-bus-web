export interface AddStaffRequest {
  name: string;
  phoneNumber: string;
  password: string;
}

export interface StaffListPaginated {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  data: StaffListItem[];
}

export interface StaffListItem {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  hasPassword: boolean;
}

export interface UpdateStaffRequest {
  name: string;
  phoneNumber: string;
  isActive: boolean;
}

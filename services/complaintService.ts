// -------------------------------------------------------------
//  Tiny service to keep API-specific code out of the component.
// -------------------------------------------------------------
import { api } from '@/lib/axios';

export interface CreateComplaintPayload {
  complaintType: string;
  complaintDetails: string;
}

export interface Complaint {
  _id: string;
  customerId: string;
  complaintType: string;
  complaintDetails: string;
  complaintStatus: 'Pending' | 'Resolved' | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintResponse {
  message: string;
  complaint: Complaint;
}

export const createComplaint = async (
  payload: CreateComplaintPayload,
): Promise<CreateComplaintResponse> => {
  const { data } = await api.post<CreateComplaintResponse>(
    '/complaint',
    payload,
  );
  return data;
};

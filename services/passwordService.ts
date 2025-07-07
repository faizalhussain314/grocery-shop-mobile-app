import { api } from "@/lib/axios";

export const changePassword = async (newPassword: string, userId: string) => {
  try {
    console.log("userid from service", userId)
    const response = await api.patch(`/auth/updatePassword/${userId}`, {
      newpassword: newPassword
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    throw error;
  }
};
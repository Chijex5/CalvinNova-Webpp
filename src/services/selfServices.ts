import api from "../utils/apiService";
export interface CheckoutData {
    productId: number;
    sellerId: string;
    transactionId: string;
    title: string;
    sellerName: string;
    buyerName: string;
    buyerEmail: string;
    buyerId: string;
    amount: number;
}

const selfService = {
    checkout: async (data: CheckoutData) : Promise<{success: boolean, message?: string}> => {
        try{
            const response = await api.post("/api/checkout", data)
            if (response.data.success) {
                return response.data;
            }
            return { success: false, message: "Checkout failed" };
        } catch (error: any) {
            return { success: false, message: error.message || "Checkout failed" };
        } 
    }
}

export default selfService;
import { env } from '../config/env';

interface ZarinPalRequestResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    fee_type: string;
    fee: number;
  };
  errors: any[];
}

interface ZarinPalVerifyResponse {
  data: {
    code: number;
    message: string;
    card_hash: string;
    card_pan: string;
    ref_id: number;
    fee_type: string;
    fee: number;
  };
  errors: any[];
}

export const zarinpalService = {
  requestPayment: async (amount: number, description: string, callbackUrl: string, mobile?: string, email?: string) => {
    try {
      const response = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          merchant_id: env.ZARINPAL_MERCHANT_ID,
          amount,
          description,
          callback_url: callbackUrl,
          metadata: {
            mobile,
            email
          }
        })
      });

      const data = await response.json() as ZarinPalRequestResponse;

      if (data.data && data.data.code === 100) {
        return {
          success: true,
          authority: data.data.authority,
          paymentUrl: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`
        };
      }

      return {
        success: false,
        error: data.errors
      };

    } catch (error) {
      console.error('ZarinPal Request Error:', error);
      return { success: false, error };
    }
  },

  verifyPayment: async (amount: number, authority: string) => {
    try {
      const response = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          merchant_id: env.ZARINPAL_MERCHANT_ID,
          amount,
          authority
        })
      });

      const data = await response.json() as ZarinPalVerifyResponse;

      if (data.data && (data.data.code === 100 || data.data.code === 101)) {
        return {
          success: true,
          refId: data.data.ref_id,
          cardPan: data.data.card_pan
        };
      }

      return {
        success: false,
        code: data.data?.code
      };
    } catch (error) {
      console.error('ZarinPal Verify Error:', error);
      return { success: false, error };
    }
  }
};

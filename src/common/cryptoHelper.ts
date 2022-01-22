import * as axios from "axios";

export default class CryptoHelper {
    private static usdCurrencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    
    private static vndCurrencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });

    public static async getCryptoPrice(coin: string) {
        const usd = await axios.default.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
        ).then(res => {
            return CryptoHelper.usdCurrencyFormatter.format(res.data[coin]["usd"])
        });
        const vnd = await axios.default.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=vnd`
        ).then(res => {
            return CryptoHelper.vndCurrencyFormatter.format(res.data[coin]["vnd"])
        });

        return { usd, vnd };
    }
}
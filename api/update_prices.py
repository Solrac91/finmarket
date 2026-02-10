import os
import time
import requests
from supabase import create_client, Client
from datetime import datetime

# Configuración de Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# APIs gratuitas para precios
COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price"
TWELVE_DATA_API = "https://api.twelvedata.com/price"

def get_crypto_price(symbol):
    """Obtiene precio de criptomoneda desde CoinGecko"""
    crypto_ids = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        'MATIC': 'matic-network'
    }
    
    if symbol not in crypto_ids:
        return None
    
    try:
        params = {
            'ids': crypto_ids[symbol],
            'vs_currencies': 'usd',
            'include_24hr_change': 'true'
        }
        response = requests.get(COINGECKO_API, params=params, timeout=10)
        data = response.json()
        
        crypto_data = data.get(crypto_ids[symbol], {})
        return {
            'price': crypto_data.get('usd'),
            'change_24h': crypto_data.get('usd_24h_change', 0)
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

def update_prices():
    """Actualiza todos los precios en Supabase"""
    print(f"[{datetime.now()}] Actualizando precios...")
    
    # Lista de símbolos a actualizar
    symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC']
    
    for symbol in symbols:
        price_data = get_crypto_price(symbol)
        
        if price_data and price_data['price']:
            try:
                supabase.table('asset_prices').update({
                    'current_price': price_data['price'],
                    'change_24h': price_data['change_24h'],
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('symbol', symbol).execute()
                
                print(f"✓ {symbol}:  ({price_data['change_24h']:.2f}%)")
            except Exception as e:
                print(f"✗ Error updating {symbol}: {e}")
        else:
            print(f"✗ No data for {symbol}")
    
    print(f"[{datetime.now()}] Actualización completada\n")

if __name__ == "__main__":
    print("🚀 Iniciando servicio de actualización de precios...")
    print(f"Intervalo: cada 5 minutos\n")
    
    while True:
        try:
            update_prices()
            time.sleep(300)  # 5 minutos
        except KeyboardInterrupt:
            print("\n⏹ Servicio detenido")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(60)

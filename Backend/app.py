from pathlib import Path
import platform
import threading
import time
import webbrowser

import httpx
import psutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="CyberOS Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CITIES = {
    "cartagena": {"name": "Cartagena", "lat": 10.3910, "lon": -75.4794},
    "bogota": {"name": "Bogotá", "lat": 4.7110, "lon": -74.0721},
    "medellin": {"name": "Medellín", "lat": 6.2442, "lon": -75.5812},
    "cali": {"name": "Cali", "lat": 3.4516, "lon": -76.5320},
    "barranquilla": {"name": "Barranquilla", "lat": 10.9685, "lon": -74.7813},
}


def classify_weather(temp: float, humidity: int, code: int) -> dict:
    if code in (95, 96, 99):
        sky_icon, sky_label = "⛈️", "TORMENTA ELÉCTRICA"
    elif code in (80, 81, 82):
        sky_icon, sky_label = "🌩️", "TORMENTA"
    elif code in (51, 53, 55, 61, 63, 65):
        sky_icon, sky_label = "🌧️", "LLUVIA"
    elif code in (1, 2, 3, 45, 48):
        sky_icon, sky_label = "☁️", "NUBLADO"
    else:
        sky_icon, sky_label = "☀️", "DESPEJADO"

    if temp >= 34:
        thermal_icon, thermal_label = "🔥", "CALOR EXCESIVO"
    elif temp >= 27:
        thermal_icon, thermal_label = "🌡️", "CALOR"
    elif temp <= 8:
        thermal_icon, thermal_label = "🥶", "FRÍO EXCESIVO"
    elif temp <= 15:
        thermal_icon, thermal_label = "❄️", "FRÍO"
    elif humidity >= 80:
        thermal_icon, thermal_label = "💧", f"HUMEDAD {humidity}%"
    else:
        thermal_icon, thermal_label = "🍃", f"CONFORT {humidity}%"

    return {
        "sky_icon": sky_icon,
        "sky_label": sky_label,
        "thermal_icon": thermal_icon,
        "thermal_label": thermal_label,
    }


@app.get("/api/weather/{city_key}")
async def get_weather(city_key: str):
    city = CITIES.get(city_key.lower())
    if not city:
        raise HTTPException(status_code=404, detail="Ciudad no soportada")

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={city['lat']}&longitude={city['lon']}"
        f"&current=temperature_2m,relative_humidity_2m,weather_code"
    )

    async with httpx.AsyncClient(timeout=8.0) as client:
        res = await client.get(url)
        data = res.json()

    current = data["current"]
    temp = round(current["temperature_2m"], 1)
    humidity = int(current["relative_humidity_2m"])
    code = int(current["weather_code"])

    status = classify_weather(temp, humidity, code)

    return {
        "city": city["name"],
        "temp": temp,
        "humidity": humidity,
        **status,
    }


@app.get("/api/currency")
async def get_currency_rates():
    url = "https://open.er-api.com/v6/latest/USD"
    async with httpx.AsyncClient(timeout=8.0) as client:
        res = await client.get(url)
        data = res.json()

    rates = data["rates"]
    cop_per_usd = rates["COP"]

    currencies = [
        {"code": "USD", "name": "Dólar EEUU", "value_cop": round(cop_per_usd, 1)},
        {"code": "EUR", "name": "Euro", "value_cop": round(cop_per_usd / rates["EUR"], 1)},
        {"code": "GBP", "name": "Libra UK", "value_cop": round(cop_per_usd / rates["GBP"], 1)},
        {"code": "BRL", "name": "Real BR (x5)", "value_cop": round((cop_per_usd / rates["BRL"]) * 5, 1)},
        {"code": "MXN", "name": "Peso MX (x10)", "value_cop": round((cop_per_usd / rates["MXN"]) * 10, 1)},
    ]

    return {
        "base": "COP",
        "usd_cop": round(cop_per_usd, 2),
        "currencies": currencies,
    }


@app.get("/api/sysinfo")
async def get_system_info():
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    cpu_percent = psutil.cpu_percent(interval=0.1)
    uptime_sec = int(time.time() - psutil.boot_time())
    hours, remainder = divmod(uptime_sec, 3600)
    minutes, _ = divmod(remainder, 60)

    return {
        "os": f"{platform.system()} {platform.release()}",
        "arch": platform.machine(),
        "python": platform.python_version(),
        "cpu_cores": psutil.cpu_count(logical=True),
        "cpu_usage": f"{cpu_percent}%",
        "ram": f"{round(ram.used / (1024**3), 1)}GB / {round(ram.total / (1024**3), 1)}GB ({ram.percent}%)",
        "disk_free": f"{round(disk.free / (1024**3), 1)}GB FREE",
        "uptime": f"{hours}h {minutes}m",
    }


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "Frontend"


@app.get("/")
async def serve_dashboard():
    return FileResponse(FRONTEND_DIR / "Index.html")


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")


if __name__ == "__main__":
    import uvicorn

    threading.Timer(1.2, lambda: webbrowser.open("http://127.0.0.1:8000")).start()
    uvicorn.run(app, host="127.0.0.1", port=8000)
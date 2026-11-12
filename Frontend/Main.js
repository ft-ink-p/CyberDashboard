function updateMainframeData(): void {
    const coreTemp = (Math.random() * (98.9 - 45.0) + 45.0).toFixed(1);
    const statuses = ["SECURE", "BREACH_DETECTED", "ENCRYPTING...", "SECURE"];
    const networkStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const activeProxies = Math.floor(Math.random() * (255 - 10 + 1)) + 10;

    const tempElement = document.getElementById('temp')!;
    tempElement.textContent = coreTemp;
    tempElement.style.color = parseFloat(coreTemp) > 85 ? "#f00" : "#0ff";

    const statusElement = document.getElementById('status')!;
    statusElement.textContent = networkStatus;
    statusElement.style.color = networkStatus === "BREACH_DETECTED" ? "#f00" : "#f0f";

    // Actualizamos proxies
    document.getElementById('proxies')!.textContent = activeProxies.toString();
}

setInterval(updateMainframeData, 1000);
updateMainframeData();
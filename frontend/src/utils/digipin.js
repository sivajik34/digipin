const DIGIPIN_GRID = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T'],
  ];
  
  const BOUNDS = {
    minLat: 2.5,
    maxLat: 38.5,
    minLon: 63.5,
    maxLon: 99.5,
  };
  
  export function encodeDigipinOffline(lat, lon) {
    if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat || lon < BOUNDS.minLon || lon > BOUNDS.maxLon) {
      throw new Error("Coordinates out of range for DIGIPIN encoding");
    }
  
    let digipin = "";
    let minLat = BOUNDS.minLat, maxLat = BOUNDS.maxLat;
    let minLon = BOUNDS.minLon, maxLon = BOUNDS.maxLon;
  
    for (let level = 1; level <= 10; level++) {
      let latDiv = (maxLat - minLat) / 4;
      let lonDiv = (maxLon - minLon) / 4;
  
      let row = 3 - Math.floor((lat - minLat) / latDiv);
      let col = Math.floor((lon - minLon) / lonDiv);
  
      row = Math.max(0, Math.min(3, row));
      col = Math.max(0, Math.min(3, col));
  
      digipin += DIGIPIN_GRID[row][col];
      if (level === 3 || level === 6) digipin += "-";
  
      maxLat = minLat + latDiv * (4 - row);
      minLat = minLat + latDiv * (3 - row);
      minLon = minLon + lonDiv * col;
      maxLon = minLon + lonDiv;
    }
  
    return digipin;
  }
  export function decodeDigipinOffline(digipin) {
    const cleanPin = digipin.replace(/-/g, "").toUpperCase();
    if (cleanPin.length !== 10) throw new Error("Invalid DIGIPIN length");
  
    let minLat = BOUNDS.minLat, maxLat = BOUNDS.maxLat;
    let minLon = BOUNDS.minLon, maxLon = BOUNDS.maxLon;
  
    for (let i = 0; i < 10; i++) {
      const char = cleanPin[i];
      let found = false;
  
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (DIGIPIN_GRID[row][col] === char) {
            const latDiv = (maxLat - minLat) / 4;
            const lonDiv = (maxLon - minLon) / 4;
  
            maxLat = minLat + latDiv * (4 - row);
            minLat = minLat + latDiv * (3 - row);
            minLon = minLon + lonDiv * col;
            maxLon = minLon + lonDiv;
  
            found = true;
            break;
          }
        }
        if (found) break;
      }
  
      if (!found) throw new Error(`Invalid character in DIGIPIN: ${char}`);
    }
  
    const lat = ((minLat + maxLat) / 2).toFixed(6);
    const lon = ((minLon + maxLon) / 2).toFixed(6);
    return { lat, lon };
  }
    
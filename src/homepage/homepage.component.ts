import {AfterViewInit, Component, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import {isPlatformBrowser, NgClass, NgFor} from "@angular/common";

// An interface to define the shape of our star data
interface Star {
  cx: string;
  cy: string;
  r: number;
  hidden: boolean;
  pixelX: number;
  pixelY: number;
  color: string;
}

interface Planet {
  cx: string;
  cy: string;
  r: number;
  name: string;
  color: string;
  hidden: boolean;
  pixelX: number;
  pixelY: number;
  longitude: number;
  latitude: number;
  altitude?: number;
  azimuth?: number;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NgFor, NgClass], // Import NgFor for the template
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements AfterViewInit{
  @ViewChild('backgroundCanvas') backgroundCanvas!: ElementRef<HTMLCanvasElement>;

  public context!: CanvasRenderingContext2D;
  public stars: Star[] = [];
  public planets: Planet[] = [];
  private readonly starCount = 1500;

  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser) {
      this.setCanvasSizeAndDraw();
    }


  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.context = this.backgroundCanvas.nativeElement.getContext('2d')!;
      this.generateStars();

      this.setCanvasSizeAndDraw();
      this.getUserLocation();
    }
  }

  private getUserLocation(): void {
    if (!this.isBrowser || !('geolocation' in navigator)) {
      // Fallback if geolocation isn't supported
      this.generatePlanets();
      this.setCanvasSizeAndDraw();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const observer = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        this.generatePlanets(observer);
        this.setCanvasSizeAndDraw();
      },
      (error) => {
        console.warn('Geolocation failed or denied, using default location.', error);
        this.generatePlanets();
        this.setCanvasSizeAndDraw();
      }
    );
  }

  private setCanvasSizeAndDraw(): void {
    const canvas = this.backgroundCanvas.nativeElement;
    const parent = canvas.parentElement!;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    this.drawBackground();
    this.updateElementsPixelCoordinates(canvas.width, canvas.height);
  }

  private drawBackground(): void {
    const { width, height } = this.context.canvas;

    const gradient = this.context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a51');
    gradient.addColorStop(0.5, '#3d456e');
    gradient.addColorStop(1, '#000000');

    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, width, height);

    // The star drawing logic is now handled by the SVG template
  }

  private generateStars(): void {
    const tempStars: Star[] = [];
    const coldColors = [
      'rgba(173, 216, 230, 0.8)', // LightBlue
      'rgba(135, 206, 235, 0.8)', // SkyBlue
      'rgba(0, 191, 255, 0.8)',   // DeepSkyBlue
      'rgba(30, 144, 255, 0.8)',  // DodgerBlue
      'rgba(100, 149, 237, 0.8)', // CornflowerBlue
      'rgba(123, 104, 238, 0.8)', // MediumSlateBlue
      'rgba(175, 238, 238, 0.8)', // PaleTurquoise
      'rgba(0, 255, 255, 0.8)',   // Cyan
      'rgba(127, 255, 212, 0.8)', // Aquamarine
      'rgba(240, 248, 255, 0.8)', // AliceBlue
      'rgba(255, 255, 255, 0.8)', // White (neutral but fits)
    ];

    for (let i = 0; i < this.starCount; i++) {
      const colorIndex = Math.floor(Math.random() * coldColors.length);
      tempStars.push({
        cx: `${Math.random() * 100}%`, // Use percentages for responsive positioning
        cy: `${Math.pow(Math.random(),2) * 50}%`,
        r: Math.random() * 1.5 + 0.5, // Add a minimum radius to ensure visibility
        hidden: false,
        pixelX: 0,
        pixelY: 0,
        color: coldColors[colorIndex]
      });
    }
    this.stars = tempStars;
  }

  private generatePlanets(observerOverride?: {lat: number, lon: number}): void {
    const now = new Date();

    // Default location: Greenwich
    const observer = observerOverride || {
      lat: 51.4779,
      lon: 0.0015
    };

    const positions = this.calculateHorizontalCoordinates(now, observer.lat, observer.lon);

    const planetStyles = {
      'Mercury': { color: '#A5A5A5', r: 4 },
      'Venus': { color: '#E3BB76', r: 7 },
      'Mars': { color: '#E27B58', r: 5 },
      'Jupiter': { color: '#D39C7E', r: 20 },
      'Saturn': { color: '#C5AB6E', r: 17 },
      'Uranus': { color: '#BBE1E4', r: 12 },
      'Neptune': { color: '#6081FF', r: 11.5 },
      'Moon': { color: '#F4F4F4', r: 6 }
    };

    const tempPlanets: Planet[] = [];
    for (const [name, coords] of Object.entries(positions)) {
      const style = planetStyles[name as keyof typeof planetStyles];
      if (!style) continue;

      // Only show planets above horizon
      if (coords.alt < 0) continue;

      // Map Azimuth (0-360) to X (0-100%)
      // 0 is North, 90 East, 180 South, 270 West
      // We'll map North-East-South-West-North to 0-100%
      const xPercent = (coords.az / 360) * 100;

      // Map Altitude (0-90) to Y (top half of screen, e.g. 0-50%)
      // 90 (Zenith) is top (0%), 0 (Horizon) is bottom of sky (50%)
      const yPercent = 50 - (coords.alt / 90) * 50;

      tempPlanets.push({
        name: name,
        color: style.color,
        r: style.r,
        cx: `${xPercent}%`,
        cy: `${yPercent}%`,
        hidden: false,
        pixelX: 0,
        pixelY: 0,
        longitude: coords.lon,
        latitude: coords.lat,
        altitude: coords.alt,
        azimuth: coords.az
      });
    }
    this.planets = tempPlanets;
  }

  /**
   * Calculates Altitude and Azimuth for planets based on date and observer location.
   */
  private calculateHorizontalCoordinates(date: Date, lat: number, lon: number): Record<string, any> {
    const eclipticPos = this.calculateGeocentricCoordinates(date);
    const d = (date.getTime() / 86400000) - (new Date('2000-01-01T12:00:00Z').getTime() / 86400000);

    // Obliquity of the ecliptic
    const ecl = 23.4393 - 3.563E-7 * d;

    const rad = (x: number) => x * Math.PI / 180.0;
    const deg = (x: number) => x * 180.0 / Math.PI;

    const L0 = 280.46061837;
    const L1 = 360.98564736629;

    let gmst = (L0 + L1 * d) % 360;
    if (gmst < 0) gmst += 360;
    let lst = (gmst + lon) % 360;
    if (lst < 0) lst += 360;

    const results: Record<string, any> = {};

    for (const name in eclipticPos) {
      const pos = eclipticPos[name] as {lon: number, lat: number};
      const { lon: pLon, lat: pLat } = pos;

      // Ecliptic to Equatorial
      const x = Math.cos(rad(pLon)) * Math.cos(rad(pLat));
      const y = Math.sin(rad(pLon)) * Math.cos(rad(pLat));
      const z = Math.sin(rad(pLat));

      const xeq = x;
      const yeq = y * Math.cos(rad(ecl)) - z * Math.sin(rad(ecl));
      const zeq = y * Math.sin(rad(ecl)) + z * Math.cos(rad(ecl));

      const ra = deg(Math.atan2(yeq, xeq));
      const dec = deg(Math.atan2(zeq, Math.sqrt(xeq * xeq + yeq * yeq)));

      // Equatorial to Horizontal
      const ha = (lst - ra + 360) % 360;

      const xh = Math.cos(rad(ha)) * Math.cos(rad(dec));
      const yh = Math.sin(rad(ha)) * Math.cos(rad(dec));
      const zh = Math.sin(rad(dec));

      const xhor = xh * Math.sin(rad(lat)) - zh * Math.cos(rad(lat));
      const yhor = yh;
      const zhor = xh * Math.cos(rad(lat)) + zh * Math.sin(rad(lat));

      let az = deg(Math.atan2(yhor, xhor)) + 180;
      az = az % 360;
      const alt = deg(Math.atan2(zhor, Math.sqrt(xhor * xhor + yhor * yhor)));

      results[name] = { az, alt, lon: pLon, lat: pLat };
    }

    return results;
  }

  /**
   * Calculates geocentric ecliptic coordinates (longitude and latitude).
   */
  private calculateGeocentricCoordinates(date: Date): Record<string, {lon: number, lat: number}> {
    const d = (date.getTime() / 86400000) - (new Date('2000-01-01T12:00:00Z').getTime() / 86400000);

    const rev = (x: number) => x - Math.floor(x / 360.0) * 360.0;
    const rad = (x: number) => x * Math.PI / 180.0;
    const deg = (x: number) => x * 180.0 / Math.PI;

    const solveKepler = (M: number, e: number) => {
      let E = M + e * Math.sin(rad(M)) * (1.0 + e * Math.cos(rad(M)));
      for (let i = 0; i < 3; i++) {
        E = E - (E - e * deg(Math.sin(rad(E))) - M) / (1 - e * Math.cos(rad(E)));
      }
      return E;
    };

    const getHeliocentric = (elements: any, d: number) => {
      const N = rev(elements.N[0] + elements.N[1] * d);
      const i = elements.i[0] + elements.i[1] * d;
      const w = rev(elements.w[0] + elements.w[1] * d);
      const a = elements.a[0] + elements.a[1] * d;
      const e = elements.e[0] + elements.e[1] * d;
      const M = rev(elements.M[0] + elements.M[1] * d);

      const E = solveKepler(M, e);
      const xv = a * (Math.cos(rad(E)) - e);
      const yv = a * (Math.sqrt(1.0 - e * e) * Math.sin(rad(E)));

      const v = deg(Math.atan2(yv, xv));
      const r = Math.sqrt(xv * xv + yv * yv);

      const cosN = Math.cos(rad(N)), sinN = Math.sin(rad(N));
      const cosVW = Math.cos(rad(v + w)), sinVW = Math.sin(rad(v + w));
      const cosi = Math.cos(rad(i));

      const x = r * (cosN * cosVW - sinN * sinVW * cosi);
      const y = r * (sinN * cosVW + cosN * sinVW * cosi);
      const z = r * (sinVW * Math.sin(rad(i)));

      return { x, y, z };
    };

    const elements: Record<string, any> = {
      Sun: { // Actually Earth's orbit
        N: [0.0, 0.0], i: [0.0, 0.0], w: [282.9404, 4.70935E-5],
        a: [1.000000, 0.0], e: [0.016709, -1.151E-9], M: [356.0470, 0.9856002585]
      },
      Mercury: {
        N: [48.3313, 3.24587E-5], i: [7.0047, 5.00E-8], w: [29.1241, 1.01444E-5],
        a: [0.387098, 0.0], e: [0.205635, 5.59E-10], M: [168.6562, 4.0923344368]
      },
      Venus: {
        N: [76.6799, 2.46590E-5], i: [3.3946, 2.75E-8], w: [54.8910, 1.38374E-5],
        a: [0.723330, 0.0], e: [0.006773, -1.302E-9], M: [48.0052, 1.6021302244]
      },
      Mars: {
        N: [49.5574, 2.11081E-5], i: [1.8497, -1.78E-8], w: [286.5016, 2.92961E-5],
        a: [1.523688, 0.0], e: [0.093405, 2.516E-9], M: [18.6021, 0.5240207766]
      },
      Jupiter: {
        N: [100.4542, 2.76854E-5], i: [1.3030, -1.557E-7], w: [273.8777, 1.64505E-5],
        a: [5.20256, 0.0], e: [0.048498, 4.469E-9], M: [19.8950, 0.0830853001]
      },
      Saturn: {
        N: [113.6655, 2.38886E-5], i: [2.4886, -1.081E-7], w: [339.3939, 2.97661E-5],
        a: [9.55475, 0.0], e: [0.055546, -9.499E-9], M: [316.9670, 0.0334442282]
      },
      Uranus: {
        N: [74.0005, 1.3978E-5], i: [0.7733, 1.9E-8], w: [96.6612, 3.0565E-5],
        a: [19.18171, -1.55E-8], e: [0.047318, 7.45E-9], M: [142.5905, 0.011725806]
      },
      Neptune: {
        N: [131.7806, 3.0173E-5], i: [1.7700, -2.55E-7], w: [272.8461, -6.027E-6],
        a: [30.05826, 3.313E-8], e: [0.008606, 2.15E-9], M: [260.2471, 0.005995147]
      }
    };

    const sunPos = getHeliocentric(elements['Sun'], d);
    const results: Record<string, {lon: number, lat: number}> = {};

    for (const planet in elements) {
      if (planet === 'Sun') continue;
      const planetPos = getHeliocentric(elements[planet], d);
      const xgeoc = planetPos.x + sunPos.x;
      const ygeoc = planetPos.y + sunPos.y;
      const zgeoc = planetPos.z + sunPos.z;

      const lon = rev(deg(Math.atan2(ygeoc, xgeoc)));
      const lat = deg(Math.atan2(zgeoc, Math.sqrt(xgeoc * xgeoc + ygeoc * ygeoc)));
      results[planet] = { lon, lat };
    }

    // Simplified Moon (relative to Earth)
    const Nm = rev(125.1228 - 0.0529538083 * d);
    const im = 5.1454;
    const wm = rev(318.0634 + 0.1643573223 * d);
    const am = 60.2666; // Earth radii
    const em = 0.054900;
    const Mm = rev(115.3654 + 13.0649929509 * d);

    const Em = solveKepler(Mm, em);
    const xvm = am * (Math.cos(rad(Em)) - em);
    const yvm = am * (Math.sqrt(1.0 - em * em) * Math.sin(rad(Em)));
    const vm = deg(Math.atan2(yvm, xvm));
    const rm = Math.sqrt(xvm * xvm + yvm * yvm);

    const cosNm = Math.cos(rad(Nm)), sinNm = Math.sin(rad(Nm));
    const cosVWm = Math.cos(rad(vm + wm)), sinVWm = Math.sin(rad(vm + wm));
    const cosim = Math.cos(rad(im));

    const xm = rm * (cosNm * cosVWm - sinNm * sinVWm * cosim);
    const ym = rm * (sinNm * cosVWm + cosNm * sinVWm * cosim);
    const zm = rm * (sinVWm * Math.sin(rad(im)));

    results['Moon'] = {
      lon: rev(deg(Math.atan2(ym, xm))),
      lat: deg(Math.atan2(zm, Math.sqrt(xm * xm + ym * ym)))
    };

    return results;
  }

  private updateElementsPixelCoordinates(width: number, height: number) {
    for (const star of this.stars) {
      star.pixelX = (parseFloat(star.cx)/100) * width;
      star.pixelY = (parseFloat(star.cy)/100) * height;
    }
    for (const planet of this.planets) {
      planet.pixelX = (parseFloat(planet.cx)/100) * width;
      planet.pixelY = (parseFloat(planet.cy)/100) * height;
    }
  }
}

/**
 * Deterministic, dependency-free Beijing solar/daylight state.
 *
 * Solar approximation: NOAA, General Solar Position Calculations
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 * Elevation is the geometric solar centre, without atmospheric refraction.
 * Coordinates and all rendering responses are illustrative approximations;
 * see docs/current-state/r15-flight-daynight/DAY-CYCLE-SOURCES.md.
 */

export const BEIJING_SITE = Object.freeze({
  latitudeDegrees: 39.916,
  longitudeDegrees: 116.397,
  utcOffsetMinutes: 480,
  coordinatesAreApproximate: true,
});

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
const mix = (a, b, amount) => a + (b - a) * amount;
const mixColor = (a, b, amount) => a.map((value, i) => mix(value, b[i], amount));
const pad2 = value => String(value).padStart(2, '0');

function smoothstep(low, high, value) {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
}

function requireDate(date) {
  if (!(date instanceof Date)) throw new TypeError('Expected a UTC instant supplied as a Date.');
  if (!Number.isFinite(date.getTime())) throw new RangeError('Expected a valid Date.');
}

/** Fixed UTC+8 civil calendar, independent of host time zone or DST settings. */
export function getBeijingTime(date) {
  requireDate(date);
  const shifted = new Date(date.getTime() + BEIJING_SITE.utcOffsetMinutes * 60000);
  if (!Number.isFinite(shifted.getTime())) throw new RangeError('Date is outside the supported UTC+8 calendar range.');
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  const second = shifted.getUTCSeconds();
  const millisecond = shifted.getUTCMilliseconds();
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthLengths = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dayOfYear = day + monthLengths.slice(0, month - 1).reduce((a, b) => a + b, 0);
  return {
    year, month, day, hour, minute, second, millisecond, dayOfYear,
    daysInYear: leapYear ? 366 : 365,
    minutesOfDay: hour * 60 + minute + second / 60 + millisecond / 60000,
    utcOffsetMinutes: BEIJING_SITE.utcOffsetMinutes,
    dateLabel: shifted.toISOString().split('T')[0],
    timeLabel: `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`,
  };
}

/**
 * Unit vector from a model point TOWARDS the sun, not the light-ray direction.
 * Compass azimuth is clockwise from north: +X west, +Z north, +Y up.
 */
export function compassSunDirection(azimuthDegrees, elevationDegrees) {
  if (!Number.isFinite(azimuthDegrees) || !Number.isFinite(elevationDegrees)
      || elevationDegrees < -90 || elevationDegrees > 90) {
    throw new RangeError('Sun angles must be finite and elevation must be within [-90, 90].');
  }
  const azimuth = modulo(azimuthDegrees, 360) * DEG_TO_RAD;
  const elevation = elevationDegrees * DEG_TO_RAD;
  const horizontal = Math.cos(elevation);
  return {
    x: -horizontal * Math.sin(azimuth),
    y: Math.sin(elevation),
    z: horizontal * Math.cos(azimuth),
  };
}

function solarFromLocalTime(local) {
  const fractionalYear = (2 * Math.PI / local.daysInYear)
    * (local.dayOfYear - 1 + (local.minutesOfDay / 60 - 12) / 24);
  const g = fractionalYear;
  const equationOfTimeMinutes = 229.18 * (0.000075 + 0.001868 * Math.cos(g)
    - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const declination = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const timeOffsetMinutes = equationOfTimeMinutes + 4 * BEIJING_SITE.longitudeDegrees
    - BEIJING_SITE.utcOffsetMinutes;
  const solarMinutes = modulo(local.minutesOfDay + timeOffsetMinutes, 1440);
  const hourAngleDegrees = solarMinutes / 4 - 180;
  const hourAngle = hourAngleDegrees * DEG_TO_RAD;
  const latitude = BEIJING_SITE.latitudeDegrees * DEG_TO_RAD;
  const cosineZenith = clamp(Math.sin(latitude) * Math.sin(declination)
    + Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle), -1, 1);
  const elevationDegrees = Math.asin(cosineZenith) * RAD_TO_DEG;
  // atan2 retains the east/west quadrant that an acos azimuth would lose.
  const azimuthDegrees = modulo(Math.atan2(Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude))
    * RAD_TO_DEG + 180, 360);
  return {
    azimuthDegrees,
    elevationDegrees,
    hourAngleDegrees,
    declinationDegrees: declination * RAD_TO_DEG,
    equationOfTimeMinutes,
    direction: compassSunDirection(azimuthDegrees, elevationDegrees),
  };
}

/** Geometric sun position for one UTC instant at the fixed approximate site. */
export function calculateBeijingSun(date) {
  return solarFromLocalTime(getBeijingTime(date));
}

// Decode authored sRGB swatches once. Every returned color is LINEAR RGB and
// can be passed directly to THREE.Color.fromArray / setRGB with default space.
function linearColor(hex) {
  return [hex >> 16 & 255, hex >> 8 & 255, hex & 255].map(byte => {
    const srgb = byte / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
}

const PALETTE = Object.freeze(Object.fromEntries(Object.entries({
  nightTop: 0x050b1d, dayTop: 0x4a7ba7, twilightTop: 0x3c3e79,
  nightBottom: 0x19283f, dayBottom: 0xb8d4e8, twilightBottom: 0xd99169,
  nightFog: 0x0e1a2b, dayFog: 0xd4c4a8, twilightFog: 0xb77e6b,
  lowSun: 0xff9d58, highSun: 0xfff5e1,
  nightHemisphere: 0x9bacc8, dayHemisphere: 0xfff4e6,
  nightGround: 0x6c7890, dayGround: 0x8a8272,
  nightFill: 0x9faecb, dayFill: 0xd8e8ff,
}).map(([name, hex]) => [name, Object.freeze(linearColor(hex))])));

function lightingFromElevation(elevation) {
  // These responses are art direction, not lux, measured atmosphere, modern
  // site lighting, a lunar model, or evidence of permanently installed lamps.
  const daylight = smoothstep(-6, 18, elevation);
  const skyDaylight = smoothstep(-12, 18, elevation);
  const twilight = smoothstep(-12, -1, elevation) * (1 - smoothstep(2, 20, elevation));
  const sunVisibility = smoothstep(-0.833, 3, elevation);
  const highSun = smoothstep(3, 35, elevation);
  return {
    skyTop: mixColor(mixColor(PALETTE.nightTop, PALETTE.dayTop, skyDaylight), PALETTE.twilightTop, twilight * 0.28),
    skyBottom: mixColor(mixColor(PALETTE.nightBottom, PALETTE.dayBottom, skyDaylight), PALETTE.twilightBottom, twilight * 0.8),
    fogColor: mixColor(mixColor(PALETTE.nightFog, PALETTE.dayFog, daylight), PALETTE.twilightFog, twilight * 0.6),
    sunColor: mixColor(PALETTE.lowSun, PALETTE.highSun, highSun),
    hemisphereSkyColor: mixColor(PALETTE.nightHemisphere, PALETTE.dayHemisphere, daylight),
    hemisphereGroundColor: mixColor(PALETTE.nightGround, PALETTE.dayGround, daylight),
    fillColor: mixColor(PALETTE.nightFill, PALETTE.dayFill, daylight),
    sunIntensity: sunVisibility * mix(0.45, 1.4, smoothstep(0, 45, elevation)),
    hemisphereIntensity: mix(0.48, 0.5, daylight),
    fillIntensity: mix(0.18, 0.25, daylight),
    environmentIntensity: mix(0.18, 0.6, daylight),
    exposure: mix(0.9, 1, daylight),
    daylight,
    twilight,
  };
}

/**
 * Complete immutable-by-convention snapshot; each call owns its nested data.
 * Labels are descriptive bands. Rendering must consume lighting values, never
 * switch on phase, so sunrise/sunset do not produce abrupt palette changes.
 */
export function getBeijingDayCycle(date) {
  const beijingTime = getBeijingTime(date);
  const sun = solarFromLocalTime(beijingTime);
  const phase = sun.elevationDegrees < -6 ? 'night'
    : sun.elevationDegrees >= 8 ? 'day'
      : sun.hourAngleDegrees < 0 ? 'sunrise' : 'sunset';
  return {
    timestampMs: date.getTime(),
    beijingTime,
    sun,
    phase,
    lighting: lightingFromElevation(sun.elevationDegrees),
  };
}

/**
 * 太空偷窥局 (Space Peep Bureau - SPB)
 * SGP4 Orbital Calculation Engine (orbit.js)
 * High-performance browser-side satellite pass prediction & retro-surveillance detection
 */

(function (window) {
  'use strict';

  // Constants
  const EARTH_RADIUS_KM = 6371.0;
  const RAD2DEG = 180 / Math.PI;
  const DEG2RAD = Math.PI / 180;

  // Compass directions in Chinese
  const COMPASS_POINTS = [
    { name: '北', min: 348.75, max: 360 },
    { name: '北', min: 0, max: 11.25 },
    { name: '北偏东', min: 11.25, max: 33.75 },
    { name: '东北', min: 33.75, max: 56.25 },
    { name: '东偏北', min: 56.25, max: 78.75 },
    { name: '东', min: 78.75, max: 101.25 },
    { name: '东偏南', min: 101.25, max: 123.75 },
    { name: '东南', min: 123.75, max: 146.25 },
    { name: '南偏东', min: 146.25, max: 168.75 },
    { name: '南', min: 168.75, max: 191.25 },
    { name: '南偏西', min: 191.25, max: 213.75 },
    { name: '西南', min: 213.75, max: 236.25 },
    { name: '西偏南', min: 236.25, max: 258.75 },
    { name: '西', min: 258.75, max: 281.25 },
    { name: '西偏北', min: 281.25, max: 303.75 },
    { name: '西北', min: 303.75, max: 326.25 },
    { name: '北偏西', min: 326.25, max: 348.75 }
  ];

  function getCompassDirection(deg) {
    deg = ((deg % 360) + 360) % 360;
    for (let p of COMPASS_POINTS) {
      if (deg >= p.min && deg < p.max) return p.name;
    }
    return '北';
  }

  // Haversine distance between two coordinates in km
  function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * DEG2RAD;
    const dLon = (lon2 - lon1) * DEG2RAD;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  // Approximate Sun Position in ECI (km) and Sun Elevation at Observer
  function getSunPositionECI(date) {
    // Julian Day
    const jd = date.getTime() / 86400000 + 2440587.5;
    const n = jd - 2451545.0; // days since J2000.0

    // Mean longitude of the Sun, corrected for aberration
    const L = ((280.460 + 0.9856474 * n) % 360) * DEG2RAD;
    // Mean anomaly of the Sun
    const g = ((357.528 + 0.9856003 * n) % 360) * DEG2RAD;
    // Ecliptic longitude of the Sun
    const lambda = (L + 1.915 * DEG2RAD * Math.sin(g) + 0.020 * DEG2RAD * Math.sin(2 * g));
    // Obliquity of the ecliptic
    const epsilon = (23.439 - 0.0000004 * n) * DEG2RAD;

    // Distance to Sun in AU (approx 1 AU in km = 149597870.7)
    const R_sun = (1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g)) * 149597870.7;

    const x = R_sun * Math.cos(lambda);
    const y = R_sun * Math.cos(epsilon) * Math.sin(lambda);
    const z = R_sun * Math.sin(epsilon) * Math.sin(lambda);

    return { x, y, z };
  }

  // Calculate local solar elevation angle at given observer (lat, lon) and date
  function getObserverSunElevation(lat, lon, date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const n = jd - 2451545.0;
    const L = ((280.460 + 0.9856474 * n) % 360);
    const g = ((357.528 + 0.9856003 * n) % 360) * DEG2RAD;
    const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG2RAD;
    const epsilon = 23.439 * DEG2RAD;

    // Solar declination
    const sinDec = Math.sin(epsilon) * Math.sin(lambda);
    const cosDec = Math.cos(Math.asin(sinDec));

    // Greenwhich Hour Angle (approx)
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const gmst = ((280.46061837 + 360.98564736629 * n) % 360);
    const solarTime = ((gmst + lon) % 360);
    // Hour angle
    const H = (solarTime - (Math.atan2(Math.sin(lambda) * Math.cos(epsilon), Math.cos(lambda)) * RAD2DEG)) * DEG2RAD;

    const latRad = lat * DEG2RAD;
    const sinAlt = Math.sin(latRad) * sinDec + Math.cos(latRad) * cosDec * Math.cos(H);
    return Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG;
  }

  // Test whether satellite is in Earth's shadow (cylindrical shadow model)
  function isSatelliteInSunlight(satEci, sunEci) {
    if (!satEci || !sunEci) return true;

    // Dot product
    const dot = satEci.x * sunEci.x + satEci.y * sunEci.y + satEci.z * sunEci.z;
    const satDist = Math.sqrt(satEci.x * satEci.x + satEci.y * satEci.y + satEci.z * satEci.z);
    const sunDist = Math.sqrt(sunEci.x * sunEci.x + sunEci.y * sunEci.y + sunEci.z * sunEci.z);

    const cosTheta = dot / (satDist * sunDist);
    // If satellite is on Sun-facing side of Earth, it's illuminated
    if (cosTheta >= 0) return true;

    // If on night-side, check perpendicular distance from Earth-Sun axis
    const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
    const perpDist = satDist * sinTheta;

    return perpDist > EARTH_RADIUS_KM;
  }

  // Calculate estimated visual magnitude
  function estimateVisualMagnitude(sat, rangeKm, satEci, sunEci, observerEci) {
    const stdMag = sat.standard_mag !== undefined ? sat.standard_mag : 2.0;
    // Standard distance 1000 km
    const rangeCorrection = 5 * Math.log10(Math.max(200, rangeKm) / 1000.0);

    // Phase angle beta (angle between satellite->Sun and satellite->observer)
    let phaseCorrection = 0;
    if (satEci && sunEci && observerEci) {
      const vSun = { x: sunEci.x - satEci.x, y: sunEci.y - satEci.y, z: sunEci.z - satEci.z };
      const vObs = { x: observerEci.x - satEci.x, y: observerEci.y - satEci.y, z: observerEci.z - satEci.z };
      const lenSun = Math.sqrt(vSun.x * vSun.x + vSun.y * vSun.y + vSun.z * vSun.z);
      const lenObs = Math.sqrt(vObs.x * vObs.x + vObs.y * vObs.y + vObs.z * vObs.z);
      if (lenSun > 0 && lenObs > 0) {
        const cosBeta = (vSun.x * vObs.x + vSun.y * vObs.y + vSun.z * vObs.z) / (lenSun * lenObs);
        // Lambertian sphere phase law: phi = (sin(beta) + (pi - beta)*cos(beta)) / pi
        const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
        const phi = (Math.sin(beta) + (Math.PI - beta) * Math.cos(beta)) / Math.PI;
        if (phi > 0.001) {
          phaseCorrection = -2.5 * Math.log10(phi);
        }
      }
    }

    const mag = stdMag + rangeCorrection + phaseCorrection;
    return Math.round(mag * 10) / 10;
  }

  // Main OrbitEngine Object
  const OrbitEngine = {
    satellites: [],
    satRecs: {},

    init(satellitesData) {
      if (!window.satellite) {
        console.error('satellite.js not loaded!');
        return false;
      }
      this.satellites = satellitesData || [];
      this.satRecs = {};

      for (let sat of this.satellites) {
        if (sat.tle_line1 && sat.tle_line2) {
          try {
            this.satRecs[sat.id] = window.satellite.twoline2satrec(sat.tle_line1, sat.tle_line2);
          } catch (e) {
            console.warn(`Failed to parse TLE for ${sat.name}:`, e);
          }
        }
      }
      return true;
    },

    /**
     * Compute current real-time geodetic positions for all tracked satellites
     */
    getLivePositions(date = new Date()) {
      const results = [];
      const gmst = window.satellite.gstime(date);

      for (let sat of this.satellites) {
        const satrec = this.satRecs[sat.id];
        if (!satrec) continue;

        try {
          const posVel = window.satellite.propagate(satrec, date);
          if (posVel && posVel.position) {
            const geodetic = window.satellite.eciToGeodetic(posVel.position, gmst);
            results.push({
              id: sat.id,
              name: sat.name,
              category: sat.category,
              lat: geodetic.latitude * RAD2DEG,
              lon: geodetic.longitude * RAD2DEG,
              altKm: geodetic.height
            });
          }
        } catch (e) {
          // ignore error on stale records
        }
      }
      return results;
    },

    /**
     * 卷宗一：被偷窥底片库
     * Compute past daytime earth-observation recon passes over target coordinates
     * @param {number} lat Observer latitude
     * @param {number} lon Observer longitude
     * @param {number} pastDays Lookback days (default 7)
     * @param {number} maxDistKm Subsatellite distance threshold (default 220km for optical swath)
     */
    computePastReconPasses(lat, lon, pastDays = 7, maxDistKm = 220) {
      const passes = [];
      const now = new Date();
      const startTime = new Date(now.getTime() - pastDays * 24 * 3600 * 1000);
      const opticalSats = this.satellites.filter(s => s.category === 'optical_recon');

      const observerGd = {
        latitude: lat * DEG2RAD,
        longitude: lon * DEG2RAD,
        height: 0.05
      };

      for (let sat of opticalSats) {
        const satrec = this.satRecs[sat.id];
        if (!satrec) continue;

        // Step through the past days. LEO orbital period is ~100 min.
        // Step in 2-minute increments for candidate detection.
        const stepMs = 2 * 60 * 1000;
        let t = startTime.getTime();
        const endT = now.getTime();

        let inCandidatePass = false;
        let passCandidates = [];

        while (t <= endT) {
          const curDate = new Date(t);
          const gmst = window.satellite.gstime(curDate);
          const posVel = window.satellite.propagate(satrec, curDate);

          if (posVel && posVel.position) {
            const geodetic = window.satellite.eciToGeodetic(posVel.position, gmst);
            const satLat = geodetic.latitude * RAD2DEG;
            const satLon = geodetic.longitude * RAD2DEG;
            const distKm = haversineDistanceKm(lat, lon, satLat, satLon);

            if (distKm <= maxDistKm) {
              const posEcf = window.satellite.eciToEcf(posVel.position, gmst);
              const lookAngles = window.satellite.ecfToLookAngles(observerGd, posEcf);
              const elevation = lookAngles.elevation * RAD2DEG;

              passCandidates.push({
                time: curDate,
                distKm,
                elevation,
                satLat,
                satLon,
                altKm: geodetic.height,
                azimuth: lookAngles.azimuth * RAD2DEG
              });
              inCandidatePass = true;
            } else if (inCandidatePass) {
              // Pass ended, find minimum distance (closest approach)
              if (passCandidates.length > 0) {
                // Find point of closest approach (min dist)
                passCandidates.sort((a, b) => a.distKm - b.distKm);
                const closest = passCandidates[0];

                // Check if daytime (sun elevation at observer > 5°) for optical photography!
                const sunElev = getObserverSunElevation(lat, lon, closest.time);
                if (sunElev > 5) {
                  // Cloud cover score simulation based on pseudo-random hash of time & coordinates
                  const seed = Math.abs(Math.sin(closest.time.getTime() * 0.0001 + lat + lon)) * 100;
                  const cloudCover = Math.floor((seed * 37) % 35) + 3; // 3% ~ 38%

                  passes.push({
                    satellite: sat,
                    closestTime: closest.time,
                    groundDistanceKm: Math.round(closest.distKm * 10) / 10,
                    elevationDeg: Math.round(closest.elevation * 10) / 10,
                    altitudeKm: Math.round(closest.altKm),
                    cloudCoverPercent: cloudCover,
                    azimuthDeg: Math.round(closest.azimuth),
                    compass: getCompassDirection(closest.azimuth),
                    resolutionM: sat.resolution_m || 10,
                    threatRating: sat.threat_rating || 'HIGH'
                  });
                }
              }
              passCandidates = [];
              inCandidatePass = false;
            }
          }
          t += stepMs;
        }
      }

      // Sort by closest time descending (most recent first)
      passes.sort((a, b) => b.closestTime - a.closestTime);
      return passes;
    },

    /**
     * 卷宗二：反向抓捕雷达
     * Compute future night-time visible passes for space stations & bright satellites (CSS, ISS, HST)
     * @param {number} lat Observer latitude
     * @param {number} lon Observer longitude
     * @param {number} futureDays Lookahead days (default 3)
     * @param {number} minElevationDeg Minimum peak elevation to qualify (default 15°)
     */
    computeFutureVisiblePasses(lat, lon, futureDays = 3, minElevationDeg = 15) {
      const visiblePasses = [];
      const now = new Date();
      const endTime = new Date(now.getTime() + futureDays * 24 * 3600 * 1000);
      const stationSats = this.satellites.filter(s => s.category === 'visual_station');

      const observerGd = {
        latitude: lat * DEG2RAD,
        longitude: lon * DEG2RAD,
        height: 0.05
      };

      for (let sat of stationSats) {
        const satrec = this.satRecs[sat.id];
        if (!satrec) continue;

        // Step 20 seconds
        const stepMs = 20 * 1000;
        let t = now.getTime();
        const endT = endTime.getTime();

        let currentPassPoints = [];
        let inPass = false;

        while (t <= endT) {
          const curDate = new Date(t);
          const gmst = window.satellite.gstime(curDate);
          const posVel = window.satellite.propagate(satrec, curDate);

          if (posVel && posVel.position) {
            const posEcf = window.satellite.eciToEcf(posVel.position, gmst);
            const lookAngles = window.satellite.ecfToLookAngles(observerGd, posEcf);
            const elevationDeg = lookAngles.elevation * RAD2DEG;
            const azimuthDeg = lookAngles.azimuth * RAD2DEG;

            // Check if satellite is above horizon (> 8 deg)
            if (elevationDeg >= 8.0) {
              // Check observer night condition (sun elevation < -6° civil twilight)
              const sunElev = getObserverSunElevation(lat, lon, curDate);

              if (sunElev < -6.0) {
                // Check if satellite is illuminated by Sun
                const sunEci = getSunPositionECI(curDate);
                const illuminated = isSatelliteInSunlight(posVel.position, sunEci);

                if (illuminated) {
                  currentPassPoints.push({
                    time: curDate,
                    elevation: elevationDeg,
                    azimuth: azimuthDeg,
                    rangeKm: lookAngles.rangeSat,
                    satEci: posVel.position,
                    sunEci
                  });
                  inPass = true;
                }
              }
            } else if (inPass) {
              // Pass finished, process candidate pass
              if (currentPassPoints.length >= 3) {
                // Find maximum elevation point
                let maxPoint = currentPassPoints[0];
                for (let p of currentPassPoints) {
                  if (p.elevation > maxPoint.elevation) {
                    maxPoint = p;
                  }
                }

                // If max elevation meets threshold
                if (maxPoint.elevation >= minElevationDeg) {
                  const risePoint = currentPassPoints[0];
                  const setPoint = currentPassPoints[currentPassPoints.length - 1];

                  const durationSec = Math.round((setPoint.time - risePoint.time) / 1000);
                  const durationMinutes = Math.floor(durationSec / 60);
                  const durationRemainSec = durationSec % 60;

                  // Observer ECI for magnitude calculation
                  const obsEcf = window.satellite.geodeticToEcf(observerGd);
                  const obsEci = window.satellite.ecfToEci(obsEcf, gmst);
                  const mag = estimateVisualMagnitude(sat, maxPoint.rangeKm, maxPoint.satEci, maxPoint.sunEci, obsEci);

                  let visibilityGrade = '肉眼清晰可见';
                  if (mag <= -2.0) {
                    visibilityGrade = '全天极度耀眼 (亮于金星/主序星)';
                  } else if (mag <= 0) {
                    visibilityGrade = '肉眼极其明显 · 城市轻度光害亦可直视';
                  } else if (mag > 2.5) {
                    visibilityGrade = '较暗天体 · 建议搭配 7x50 双筒望远镜';
                  }

                  visiblePasses.push({
                    satellite: sat,
                    rise: {
                      time: risePoint.time,
                      azimuth: Math.round(risePoint.azimuth),
                      compass: getCompassDirection(risePoint.azimuth),
                      elevation: Math.round(risePoint.elevation)
                    },
                    max: {
                      time: maxPoint.time,
                      azimuth: Math.round(maxPoint.azimuth),
                      compass: getCompassDirection(maxPoint.azimuth),
                      elevation: Math.round(maxPoint.elevation),
                      rangeKm: Math.round(maxPoint.rangeKm)
                    },
                    set: {
                      time: setPoint.time,
                      azimuth: Math.round(setPoint.azimuth),
                      compass: getCompassDirection(setPoint.azimuth),
                      elevation: Math.round(setPoint.elevation)
                    },
                    durationFormatted: `${durationMinutes} 分 ${durationRemainSec} 秒`,
                    magnitude: mag,
                    visibilityGrade,
                    allPoints: currentPassPoints // For Polar Sky Radar drawing!
                  });
                }
              }
              currentPassPoints = [];
              inPass = false;
            }
          }
          t += stepMs;
        }
      }

      // Sort by rise time ascending (next pass first)
      visiblePasses.sort((a, b) => a.rise.time - b.rise.time);
      return visiblePasses;
    }
  };

  // Expose to window
  window.OrbitEngine = OrbitEngine;

})(window);

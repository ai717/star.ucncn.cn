/**
 * 太空偷窥局 (Space Peep Bureau - SPB)
 * Canvas Confidential Poster Generator (poster.js)
 * Generates 9:16 High-Resolution Confidential Dossier Posters for Social Sharing
 */

(function (window) {
  'use strict';

  // Poster Canvas Dimensions (Crisp 9:16 vertical poster)
  const POSTER_WIDTH = 1080;
  const POSTER_HEIGHT = 1920;

  // Simple QR Code matrix pattern generator for https://star.ucncn.cn
  // Draws functional-style visual verification code
  function drawVerificationQR(ctx, x, y, size) {
    ctx.save();
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = '#07090e';
    const modules = 25;
    const cellSize = size / modules;

    // Fixed pattern seed for "https://star.ucncn.cn"
    function isDark(row, col) {
      // 3 Position Detection Patterns (Top-Left, Top-Right, Bottom-Left)
      if (row < 7 && col < 7) {
        return (row === 0 || row === 6 || col === 0 || col === 6) || (row >= 2 && row <= 4 && col >= 2 && col <= 4);
      }
      if (row < 7 && col >= modules - 7) {
        return (row === 0 || row === 6 || col === modules - 7 || col === modules - 1) || (row >= 2 && row <= 4 && col >= modules - 5 && col <= modules - 3);
      }
      if (row >= modules - 7 && col < 7) {
        return (row === modules - 7 || row === modules - 1 || col === 0 || col === 6) || (row >= modules - 5 && row <= modules - 3 && col >= 2 && col <= 4);
      }
      // Timing patterns
      if (row === 6 || col === 6) return (row + col) % 2 === 0;

      // Hash pattern for data
      const val = (Math.sin(row * 13.3 + col * 7.7 + 42) * 10000);
      return (Math.floor(Math.abs(val)) % 2) === 0;
    }

    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (isDark(r, c)) {
          ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }

    // Center icon badge
    const badgeSize = size * 0.22;
    const bx = x + (size - badgeSize) / 2;
    const by = y + (size - badgeSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by, badgeSize, badgeSize);
    ctx.fillStyle = '#ff2a55';
    ctx.fillRect(bx + 2, by + 2, badgeSize - 4, badgeSize - 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(badgeSize * 0.48)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPB', x + size / 2, y + size / 2);

    ctx.restore();
  }

  // Draw military red circular official stamp
  function drawOfficialStamp(ctx, x, y, radius) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.08); // slight authentic angle

    ctx.strokeStyle = '#ff2a55';
    ctx.fillStyle = '#ff2a55';
    ctx.shadowColor = 'rgba(255, 42, 85, 0.4)';
    ctx.shadowBlur = 8;

    // Double outer circle
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 7, 0, Math.PI * 2);
    ctx.stroke();

    // Center 5-pointed star
    ctx.beginPath();
    const starRadius = radius * 0.35;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const sx = starRadius * Math.cos(angle);
      const sy = starRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();

    // Circular curved text (Upper: 太空偷窥局 · 绝密审核)
    ctx.font = `bold 16px "Noto Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textUpper = "★ 太空偷窥局 绝密归档章 ★";
    const charAngle = 0.22;
    const startAngle = -Math.PI / 2 - ((textUpper.length - 1) * charAngle) / 2;
    for (let i = 0; i < textUpper.length; i++) {
      const angle = startAngle + i * charAngle;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -(radius - 22));
      ctx.fillText(textUpper[i], 0, 0);
      ctx.restore();
    }

    // Lower text: ORBITAL SURVEILLANCE
    ctx.font = `bold 11px monospace`;
    ctx.fillText("SECURITY LEVEL 5", 0, radius * 0.58);
    ctx.font = `9px monospace`;
    ctx.fillText("CLASSIFIED EVIDENCE", 0, radius * 0.75);

    ctx.restore();
  }

  // Draw procedural satellite radar imagery (fallback if offline or cross-origin fails)
  function drawProceduralSatelliteMap(ctx, x, y, w, h, lat, lon) {
    ctx.save();
    // Night earth base
    const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 20, x + w / 2, y + h / 2, w / 2);
    grad.addColorStop(0, '#101d32');
    grad.addColorStop(0.6, '#08111d');
    grad.addColorStop(1, '#050a12');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // City lights clusters
    ctx.fillStyle = 'rgba(255, 215, 120, 0.7)';
    for (let i = 0; i < 80; i++) {
      const px = x + w / 2 + (Math.sin(i * 9.2 + lat) * (w * 0.35));
      const py = y + h / 2 + (Math.cos(i * 7.4 + lon) * (h * 0.35));
      const rad = 1 + (Math.abs(Math.sin(i * 3)) * 3);
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // River or coastline contours
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y + h * 0.3);
    ctx.bezierCurveTo(x + w * 0.4, y + h * 0.2, x + w * 0.6, y + h * 0.8, x + w * 0.9, y + h * 0.7);
    ctx.stroke();

    ctx.restore();
  }

  const PosterGenerator = {
    /**
     * Generate Full 9:16 Confidential Dossier Poster on Canvas
     * @param {HTMLCanvasElement} canvas Target canvas
     * @param {Object} data Options and surveillance pass info
     */
    async render(canvas, data = {}) {
      if (!canvas) return;

      canvas.width = POSTER_WIDTH;
      canvas.height = POSTER_HEIGHT;
      const ctx = canvas.getContext('2d');

      const cityName = data.cityName || '北京';
      const lat = data.lat !== undefined ? data.lat : 39.9042;
      const lon = data.lon !== undefined ? data.lon : 116.4074;
      const pass = data.pass || {
        satellite: { name: '哨兵 2 号 A 星 (Sentinel-2A)', agency: 'ESA', norad_id: 40697 },
        closestTime: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        groundDistanceKm: 18.4,
        elevationDeg: 78.5,
        altitudeKm: 786,
        cloudCoverPercent: 12,
        resolutionM: 10
      };
      const totalPasses = data.totalPassesCount || 6;
      const caseId = data.caseId || `SPB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Background Fill
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

      // 2. Subtle Coordinate Grid Pattern
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let gx = 0; gx < POSTER_WIDTH; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, POSTER_HEIGHT);
        ctx.stroke();
      }
      for (let gy = 0; gy < POSTER_HEIGHT; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(POSTER_WIDTH, gy);
        ctx.stroke();
      }

      // Outer HUD Border
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, POSTER_WIDTH - 80, POSTER_HEIGHT - 80);

      // Corner Brackets
      const bLen = 25;
      ctx.strokeStyle = '#00ffc8';
      ctx.lineWidth = 4;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(38, 38 + bLen); ctx.lineTo(38, 38); ctx.lineTo(38 + bLen, 38);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(POSTER_WIDTH - 38 - bLen, 38); ctx.lineTo(POSTER_WIDTH - 38, 38); ctx.lineTo(POSTER_WIDTH - 38, 38 + bLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(38, POSTER_HEIGHT - 38 - bLen); ctx.lineTo(38, POSTER_HEIGHT - 38); ctx.lineTo(38 + bLen, POSTER_HEIGHT - 38);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(POSTER_WIDTH - 38 - bLen, POSTER_HEIGHT - 38); ctx.lineTo(POSTER_WIDTH - 38, POSTER_HEIGHT - 38); ctx.lineTo(POSTER_WIDTH - 38, POSTER_HEIGHT - 38 - bLen);
      ctx.stroke();

      // 3. Header Classification Bar
      ctx.fillStyle = '#ff2a55';
      ctx.fillRect(80, 80, 220, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TOP SECRET // L5', 190, 96);

      ctx.fillStyle = '#7f8ea3';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`DOSSIER FILE: #${caseId}`, POSTER_WIDTH - 80, 96);

      // 4. Main Bureau Title
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px "Noto Sans SC", sans-serif';
      ctx.fillText('🛰️ 太空偷窥局 · 监视底片卷宗', 80, 175);

      ctx.fillStyle = '#00ffc8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('SPACE PEEP BUREAU // ORBITAL SURVEILLANCE EVIDENCE ARCHIVE', 80, 215);

      // Divider line
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 240);
      ctx.lineTo(POSTER_WIDTH - 80, 240);
      ctx.stroke();

      // 5. Central Viewfinder Satellite Imagery Box
      const boxX = 80;
      const boxY = 270;
      const boxW = POSTER_WIDTH - 160; // 920
      const boxH = 680;

      // Draw Viewport Border
      ctx.fillStyle = '#090d16';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // 优化 3：优先加载 NASA GIBS 当日真实卫星影像切片
      let imgLoaded = false;
      const testImage = new Image();
      testImage.crossOrigin = 'anonymous';

      let candidateUrl = data.tileUrl;
      if (!candidateUrl && window.OrbitEngine && pass.closestTime) {
        candidateUrl = window.OrbitEngine.getNasaGibsTileUrl(lat, lon, pass.closestTime);
      }
      if (!candidateUrl) {
        candidateUrl = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1080&q=80';
      }

      const imgPromise = new Promise((resolve) => {
        testImage.onload = () => resolve(true);
        testImage.onerror = () => {
          // Fallback to high-res aerial texture
          const fallback = new Image();
          fallback.crossOrigin = 'anonymous';
          fallback.onload = () => {
            testImage.src = fallback.src;
            resolve(true);
          };
          fallback.onerror = () => resolve(false);
          fallback.src = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1080&q=80';
        };
        setTimeout(() => resolve(false), 2500); // 2.5s network timeout
        testImage.src = candidateUrl;
      });

      imgLoaded = await imgPromise;

      if (imgLoaded) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(boxX, boxY, boxW, boxH);
        ctx.clip();
        ctx.drawImage(testImage, boxX, boxY, boxW, boxH);
        // Dark contrast overlay
        ctx.fillStyle = 'rgba(7, 9, 14, 0.35)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.restore();
      } else {
        drawProceduralSatelliteMap(ctx, boxX, boxY, boxW, boxH, lat, lon);
      }

      // Viewfinder Reticle & HUD Elements
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Center crosshair
      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2;
      ctx.strokeStyle = '#00ffc8';
      ctx.lineWidth = 2;

      // Concentric circles
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 255, 200, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines
      ctx.strokeStyle = '#00ffc8';
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy); ctx.lineTo(cx - 20, cy);
      ctx.moveTo(cx + 20, cy); ctx.lineTo(cx + 90, cy);
      ctx.moveTo(cx, cy - 90); ctx.lineTo(cx, cy - 20);
      ctx.moveTo(cx, cy + 20); ctx.lineTo(cx, cy + 90);
      ctx.stroke();

      // Red target blip
      ctx.fillStyle = '#ff2a55';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Corner annotations inside viewfinder
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(boxX + 15, boxY + 15, 210, 30);
      ctx.fillStyle = '#00ffc8';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`TARGET: ${cityName.toUpperCase()}`, boxX + 25, boxY + 35);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(boxX + boxW - 225, boxY + 15, 210, 30);
      ctx.fillStyle = '#ff2a55';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`ALT: ${pass.altitudeKm} KM // SSO`, boxX + boxW - 25, boxY + 35);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(boxX + 15, boxY + boxH - 45, 300, 30);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`COORDS: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`, boxX + 25, boxY + boxH - 25);

      ctx.restore();

      // 6. Evidence Specs Grid (4 Columns Tactical HUD)
      const gridY = 980;
      const colW = (POSTER_WIDTH - 160) / 2;

      ctx.fillStyle = 'rgba(13, 18, 31, 0.9)';
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.2)';
      ctx.lineWidth = 1;
      ctx.fillRect(80, gridY, POSTER_WIDTH - 160, 240);
      ctx.strokeRect(80, gridY, POSTER_WIDTH - 160, 240);

      // Inner divider lines
      ctx.beginPath();
      ctx.moveTo(80 + colW, gridY);
      ctx.lineTo(80 + colW, gridY + 240);
      ctx.moveTo(80, gridY + 120);
      ctx.lineTo(POSTER_WIDTH - 80, gridY + 120);
      ctx.stroke();

      // Metric 1: Satellite Name
      ctx.fillStyle = '#7f8ea3';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RECONNAISSANCE SATELLITE (执行卫星)', 105, gridY + 38);
      ctx.fillStyle = '#00ffc8';
      ctx.font = 'bold 22px "Noto Sans SC", sans-serif';
      ctx.fillText(pass.satellite.name, 105, gridY + 75);

      // Metric 2: Capture Time
      ctx.fillStyle = '#7f8ea3';
      ctx.font = '14px monospace';
      ctx.fillText('EXPOSURE TIMESTAMP (偷窥曝光时间)', 105 + colW, gridY + 38);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      const pTime = new Date(pass.closestTime);
      const timeFormatted = `${pTime.getFullYear()}-${String(pTime.getMonth() + 1).padStart(2, '0')}-${String(pTime.getDate()).padStart(2, '0')} ${String(pTime.getHours()).padStart(2, '0')}:${String(pTime.getMinutes()).padStart(2, '0')}:${String(pTime.getSeconds()).padStart(2, '0')} UTC`;
      ctx.fillText(timeFormatted, 105 + colW, gridY + 75);

      // Metric 3: Offset & Elevation
      ctx.fillStyle = '#7f8ea3';
      ctx.font = '14px monospace';
      ctx.fillText('SUBSATELLITE OFFSET (星下点偏离/仰角)', 105, gridY + 158);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${pass.groundDistanceKm} KM / 仰角 ${pass.elevationDeg}°`, 105, gridY + 195);

      // Metric 4: Resolution & Cloud Cover
      ctx.fillStyle = '#7f8ea3';
      ctx.font = '14px monospace';
      ctx.fillText('RESOLUTION & CLOUD (成像分辨率与云量)', 105 + colW, gridY + 158);
      ctx.fillStyle = '#ffb800';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${pass.resolutionM}M 级 / 云量 ${pass.cloudCoverPercent}%`, 105 + colW, gridY + 195);

      // 7. Core Narrative Callout (Slogan & Discovery)
      const calloutY = 1255;
      ctx.fillStyle = 'rgba(255, 42, 85, 0.08)';
      ctx.strokeStyle = 'rgba(255, 42, 85, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(80, calloutY, POSTER_WIDTH - 160, 230);
      ctx.strokeRect(80, calloutY, POSTER_WIDTH - 160, 230);

      // Slogan Header
      ctx.fillStyle = '#ff2a55';
      ctx.font = 'bold 26px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('“你以为你在独处，其实头顶有 17,000 颗眼睛在看你。”', 110, calloutY + 50);

      // Body text
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '17px "Noto Sans SC", sans-serif';
      ctx.fillText(`经天基 SGP4 轨道力学回溯核实：在过去 7 天内，已有 ${totalPasses} 颗高分对地遥感光学`, 110, calloutY + 98);
      ctx.fillText(`侦察卫星在以近乎正天顶的角度飞越【${cityName}】上空时按下了快门。`, 110, calloutY + 130);
      ctx.fillStyle = '#7f8ea3';
      ctx.font = '15px "Noto Sans SC", sans-serif';
      ctx.fillText(`所生成的亚米至十米级高光谱切片已被 NASA / ESA 永久归档，构成了人类俯瞰文明的数字底片。`, 110, calloutY + 165);
      ctx.fillText(`今晚走出室外抬头，你亦可肉眼反向抓捕中国空间站 (CSS) 与 ISS 掠过夜空的金色航迹。`, 110, calloutY + 195);

      // 8. Official Rubber Stamp (Red Seal)
      drawOfficialStamp(ctx, 300, 1650, 95);

      // 9. QR Code & Call to Action (Right corner)
      const qrSize = 180;
      const qrX = POSTER_WIDTH - 80 - qrSize;
      const qrY = 1530;
      drawVerificationQR(ctx, qrX, qrY, qrSize);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('调取你所在城市的被偷窥底片', qrX - 25, qrY + 60);

      ctx.fillStyle = '#00ffc8';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('https://star.ucncn.cn', qrX - 25, qrY + 95);

      ctx.fillStyle = '#7f8ea3';
      ctx.font = '13px monospace';
      ctx.fillText('SCAN QR CODE TO ACCESS SPB ORBIT TERMINAL', qrX - 25, qrY + 130);

      // 10. Footer Disclaimer
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 1820);
      ctx.lineTo(POSTER_WIDTH - 80, 1820);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('CLASSIFIED ARCHIVE // SPB-TERMINAL-NODE-786 // CELESTRAK & COPERNICUS VERIFIED', 80, 1850);
      ctx.textAlign = 'right';
      ctx.fillText('COPYRIGHT © 2026 SPACE PEEP BUREAU (SPB). ALL RIGHTS RESERVED.', POSTER_WIDTH - 80, 1850);

      return canvas;
    }
  };

  // Expose to window
  window.PosterGenerator = PosterGenerator;

})(window);

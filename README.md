# 🛰️ 太空偷窥局 (Space Peep Bureau - SPB)

> **上线域名**：[https://star.ucncn.cn](https://star.ucncn.cn)  
> **主 Slogan**：**你以为你在独处，其实头顶有 17,000 颗眼睛在看你。**  
> **副 Slogan**：**白天调取被偷拍底片，今晚抬头反抓空间站。**  
> **归属模式**：独立二级域名纯静态项目（模式 A，与 ucncn.cn 主站解耦，主站 Git 已通过 `.gitignore` 排除本目录）  
> **版本**：v1.0.0 Production Ready

---

## 🌟 双核业务功能体系

1. **卷宗 01：【被偷窥底片库】（Past 7 Days Recon Evidence）**
   * **纯前端 SGP4 轨道动力学回溯**：根据用户所在城市或 HTML5 GPS 坐标，秒级推算过去 7 天内头顶 `< 240km` 掠过的高分光学遥感侦察卫星（`Sentinel-2A/B`, `Landsat 8/9`, `Terra`, `Aqua` 等）；
   * **真实底片调取与参数评估**：计算过境时刻、近天顶仰角、星下点偏离距离、亚米至十米级光学精度与云量遮挡评估；
   * **9:16 Canvas 绝密档案海报生成（核心裂变点）**：纯客户端即时绘制电影级机密海报，带大地经纬十字准星、绝密案卷编号、五星电子公章与专属二维码，支持一键下载与移动端原生分享朋友圈与小红书。

2. **卷宗 02：【反向抓捕雷达】（Future 72h Visible Intercept Radar）**
   * **高价值反抓目标库**：🇨🇳 **中国空间站 (CSS / 天宫)**、🛰️ **国际空间站 (ISS)**、🔭 **哈勃空间望远镜 (HST)**；
   * **严格肉眼可见条件筛选**：结合太阳三维空间位置与地球圆柱阴影模型，精准预测“地面已入夜（太阳仰角 < -6°）且高空仍被日光照亮”的高仰角过境事件；
   * **半球天顶极坐标光轨图 (Polar Sky Radar)**：动态渲染天空半球圆弧光轨，并提供「模拟今晚过境光轨」交互动画与天顶投影聚焦；
   * **商业变现触点**：植入观星装备、便携天文望远镜、双筒巡天镜推荐卡片。

---

## 📁 目录工程结构

```text
g:\work\code\website\ucncn\star\
├── index.html                 # 核心单页（暗黑档案风太空偷窥局终端界面）
├── PRD.md                     # 完整产品需求与技术架构说明书
├── README.md                  # 项目全景使用与部署指南
├── assets/
│   ├── css/
│   │   └── style.css          # 机密档案终端 UI、CRT扫描线、绝密钢印与HUD瞄准框
│   ├── data/
│   │   ├── satellites.json    # 核心卫星 NORAD TLE 双行根数与载荷参数
│   │   └── cities.json        # 国内外大城市坐标离线词典
│   └── js/
│       ├── satellite.min.js   # SGP4/SDP4 轨道力学计算引擎
│       ├── orbit.js           # 太阳位置、日夜地影判定、过境筛选模块
│       ├── poster.js          # 9:16 HTML5 Canvas 绝密海报生成器
│       └── app.js             # 终端核心交互控制、时钟、地理反查与状态联动
└── scripts/
    ├── update_tle.py          # CelesTrak 卫星最新星历自动抓取脚本
    └── nginx_star.ucncn.cn.conf # 生产环境 Nginx 高性能配置模版
```

---

## 🚀 本地开发与极速预览

本项目为 100% 纯前端零后端架构，无 Node.js 构建负担：

```bash
# 1. 进入项目根目录
cd G:\work\code\website\ucncn\star

# 2. 启动任意静态服务器 (如 Python)
python -m http.server 8089
```

在浏览器打开 `http://localhost:8089` 即可体验。

---

## 🔄 卫星 TLE 星历定时自动同步

为保持轨道预报精度的毫秒级可靠性，建议每 24 小时运行一次更新脚本：

```bash
# 执行更新（自动从 CelesTrak 抓取最新根数并刷新 assets/data/satellites.json）
python scripts/update_tle.py
```

*若部署于 Linux 服务器，可配置 crontab 每日凌晨 03:00 自动执行：*
```cron
0 3 * * * cd /var/www/star.ucncn.cn && python3 scripts/update_tle.py > /dev/null 2>&1
```

---

## 🚀 部署方案 A（首选推荐）：直接托管在 GitHub Pages (零服务器成本)

本站为 100% 纯静态单页架构，**强烈推荐直接部署在 GitHub Pages**：
* 免费全球 CDN 加速、99.99% 高可用；
* 自动签发并续期免费 Let's Encrypt HTTPS 证书；
* 内置 GitHub Actions 每 24 小时自动拉取 CelesTrak 最新星历并提交，完全免运维！

### 部署 3 步走：
1. **新建 GitHub 仓库**：在 GitHub 上创建一个新公开仓库（如 `star` 或 `space-peep`）；
2. **关联并推送代码**：
   ```bash
   cd G:\work\code\website\ucncn\star
   git remote add origin git@github.com:你的用户名/仓库名.git
   git push -u origin main
   ```
3. **开启 GitHub Pages 与自定义域名**：
   * 仓库已内置 `CNAME` 文件（写入 `star.ucncn.cn`）；
   * 进入 GitHub 仓库 -> **Settings** -> **Pages** -> Source 选择 `Deploy from a branch (main / root)`；
   * 在 DNS 服务商（如 Cloudflare / 腾讯云 / 阿里云）添加一条解析：
     * **记录类型**：`CNAME`
     * **主机记录**：`star`
     * **记录值**：`你的用户名.github.io`
   * 等待 2~5 分钟，GitHub 即可自动完成免费 SSL 签发与上线！

---

## 🌐 部署方案 B（备用）：自建 Nginx 服务器部署

若希望放在自己的独立云服务器上，配置文件已预置于 [scripts/nginx_star.ucncn.cn.conf](scripts/nginx_star.ucncn.cn.conf)：

1. **绑定域名**：配置 DNS 解析 `star.ucncn.cn` 指向服务器 IP；
2. **复制配置**：
   ```bash
   sudo cp scripts/nginx_star.ucncn.cn.conf /etc/nginx/conf.d/star.ucncn.cn.conf
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. **SSL 证书**：
   ```bash
   sudo certbot --nginx -d star.ucncn.cn
   ```

---

## 🔍 SEO 与 AI 搜索结构化数据

* 已注入 `Schema.org` 规范的 `SoftwareApplication` 与 `FAQPage` 结构化 JSON-LD；
* 底部内置 4 大核心科普专题，涵盖光学卫星分辨率极限、空间站反光物理学、SGP4 算法、Bortle 暗夜光害标度，针对 Google AI Overviews、Perplexity 与百度极速收录做了深度优化。

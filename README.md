# StarParticleFX

用于生成、集成和优化前端星辰粒子视觉效果的 Codex Skill。覆盖网页首屏、品牌展示、滚动叙事、章节转场与交互式粒子场，并包含响应式适配、性能控制、降低动态效果和曝光治理。

## 架构

```text
用户意图
  └─ SKILL.md：选择效果与执行约束
       ├─ references/effect-catalog.md：效果路由
       ├─ references/recipes/*.md：按需加载的独立配方
       ├─ references/integration.md：前端集成策略
       └─ assets/demo：无框架 Canvas 2D 演示与起点
```

## 包含的效果

每个名称链接到对应的 MP4 演示。

| # | 效果名称 | 核心感觉 | MP4 |
|---:|---|---|---|
| 01 | 星辰汇聚成图案 | 聚合、揭示、品牌记忆 | [预览](docs/media/pattern-convergence.mp4) |
| 02 | 星辰连线 | 秩序、连接、智能 | [预览](docs/media/stellar-links.mp4) |
| 03 | 星系旋涡 | 宏大、流动、宇宙 | [预览](docs/media/galaxy-vortex.mp4) |
| 04 | 黑洞坍缩 | 终结、聚焦、转场 | [预览](docs/media/black-hole-collapse.mp4) |
| 05 | 超新星爆发 | 发布、突破、高潮 | [预览](docs/media/supernova-burst.mp4) |
| 06 | 星海穿越 | 速度、探索、未来 | [预览](docs/media/warp-transit.mp4) |
| 07 | 引力透镜 | 科学、互动、空间感 | [预览](docs/media/gravity-lensing.mp4) |
| 08 | 星云呼吸 | 情绪、生命感、氛围 | [预览](docs/media/nebula-breathing.mp4) |
| 09 | 轨道系统 | 系统、生态、秩序 | [预览](docs/media/orbital-system.mp4) |
| 10 | 星尘降落 | 从宇宙到现实 | [预览](docs/media/stardust-descent.mp4) |
| 11 | 星幕折叠 | 空间、维度、艺术 | [预览](docs/media/celestial-fold.mp4) |
| 12 | 星辰分裂 | 生长、繁殖、进化 | [预览](docs/media/stellar-division.mp4) |
| 13 | 星辰冻结 | 精密、科技、静止 | [预览](docs/media/stellar-freeze.mp4) |
| 14 | 星河分流 | 路径、选择、产品矩阵 | [预览](docs/media/stellar-rivers.mp4) |
| 15 | 色彩迁移 | 情绪变化、品牌过渡 | [预览](docs/media/chromatic-migration.mp4) |
| 16 | 波浪传播 | 信息传播、能量 | [预览](docs/media/wave-propagation.mp4) |
| 17 | 群体迁徙 | 自组织、群体智能 | [预览](docs/media/flock-migration.mp4) |
| 18 | 时间倒流 | 回忆、修复、重生 | [预览](docs/media/time-reversal.mp4) |
| 19 | 负空间显影 | 神秘、克制、高级 | [预览](docs/media/negative-space-reveal.mp4) |
| 20 | 星球诞生 | 创造、世界观、起源 | [预览](docs/media/planet-birth.mp4) |
| 21 | 微观缩放 | 无限、递归、尺度 | [预览](docs/media/recursive-zoom.mp4) |

## 安装

```bash
git clone https://github.com/TabTabZL/StarParticleFX.git ~/.skills/star-particle-fx
skill-sync
```

## 使用

```text
$star-particle-fx 为首页首屏制作星辰汇聚成品牌图案的效果，保持现有 React 技术栈并支持 reduced motion。
```

Skill 会先选择最合适的效果配方，再根据现有项目决定使用 Canvas 2D、WebGL 或已有粒子库。演示页面位于 `assets/demo/index.html`，可直接通过静态服务器运行。

## 开发验证

```bash
node scripts/check-skill.mjs
python3 scripts/capture-previews.py --help
```

## License

MIT

# JellyShelf iPhone 试用版实现计划

目标：把已授权的个人商品库做成可签名、可离线打开的 iPhone 应用，经测试后提交 TestFlight 外测；正式 App Store 上架另行记录审核结果。

架构：保留现有 React 商品模型、IndexedDB 事务和 JSON 备份格式，使用 Capacitor 8 将网页资源、照片匹配模型和 WASM 打包进应用。真实资料库使用 A 版奶油色移动界面；公开网页 Demo 继续独立，示例价格不得导入真实库存。相机选图与备份分享通过原生插件连接系统功能。

约束：单人、无账号、无云同步；美元；未知官方事实留白；成交中位数仅计算已核验样本；不宣称已接通全市场成交采集。开发者凭据、试用邮箱、证书私钥、审核联系资料及本机库存均不进入公开仓库。

## 1. 商品资料正确性

- [x] 在独立回归文件覆盖新 SKU 留白、跨货号事实隔离及逐字编辑问题；本轮 26 项测试通过。
- [x] 修复 `lib/domain.ts` 和 `components/product-editor.tsx`，实现稳定 SKU 编辑快照、同货号分支共享事实与保存时归一化。
- [x] 浏览器实测：SKU 分支官方资料隔离、搜索 `QA-B` 自动打开对应分支、草稿切换品相后清空通过。
- [ ] 完成最终原生 UI 的 SKU 分支编辑、保存与重读验收；不能以单元测试代替这项实测。
- [x] 创建 `components/personal-app.tsx` 与 `src/personal.css`，复用编辑、详情、照片查询、备份组件，不使用 Demo fixtures 作库存。

## 2. iPhone 原生运行

- [x] `capacitor.config.ts` 固定应用标识与本机 origin；Vite 增加 `native` 构建到 `dist-native/`，网站继续输出 `dist/`。
- [x] `lib/platform.ts` 封装原生 JPEG 选图和系统文件分享，设定图片缩放后进入现有字节校验与存储路径；网页保留文件输入。相册保留现有 `getPhoto` 限制访问流程，未切换为新桥接；真机拍照验收另列。
- [x] `components/backup-panel.tsx` 接入原生文件缓存与分享，区分生成文件、完成系统分享与取消；系统取消行为仍待实测。
- [x] 生成 iPhone-only Xcode 工程、独立原创图标、相机权限说明及隐私清单；运行代码与模型随包提供，不依赖远程网页启动。
- [x] 添加 `public/privacy.html`、`public/support.html`，说明本机数据、外部请求和 Apple TestFlight 诊断；公开 URL 部署另列。

## 3. 验证与分发

- [x] 最终验证：26 项单元测试通过、生产依赖 audit 为 0；最终 web / native build 通过。
- [x] iPhone 17 Pro / iOS 26.5 模拟器：空库、limited 相册选图、商品保存展示及键盘附件栏下编辑框安全区通过。
- [x] 完整软件键盘在最终无调试包复测通过，输入框与保存按钮同时可见；将 `transition: all 0.2s` 限制为 opacity / transform，并加入 ResizeObserver 与有界 settle。
- [x] 同模拟器：系统分享 Save to Files 导出约 224 KB JSON 并成功回调；文件选择器重新导入预览 1 商品 / 1 照片；合并跳过已有 1 项且不覆盖。
- [x] 同模拟器：`simctl terminate` 后 `launch`，商品与照片仍在。
- [x] 同模拟器：相册照片匹配已有测试商品，返回相似度 1.00，界面仍要求人工确认实际商品。
- [x] 成本实测：拿货价 $6.50、目标 $20–30，计算得到 $13.70–15.30。
- [ ] 完成未回报的剩余原生交互验收：完整编辑/删除、SKU 分支原生复核、其他检索/收藏、样本中位数界面、取消/拒绝、空库照片恢复及断网使用。
- [ ] 在真实 iPhone 验收摄像头、方向和大图；尚无真机相机测试结果。
- [x] `1.0.0 (1)` 已完成签名 archive 和 `app-store-connect` export；Xcode 真实 Validate 界面显示通过全部验证检查。这不等于 App Review 通过。
- [x] build 2 `1.0.0 (2)` 最终构建、原生同步和签名 archive 完成；包内模型 / WASM / 隐私 / 支持齐全，无 demo chunk 或官方图片文件，仅四个静态参考 URL 保留。
- [x] 通过 Xcode 创建 JellyShelf 简体中文 App Store Connect 应用记录，App ID `6816674454`。
- [x] build 1 于 2026-09-27 21:58 CST（UTC+8）上传 Apple 成功；日志显示 `Upload succeeded` / `EXPORT SUCCEEDED`，Organizer 显示 `Uploaded to Apple`。
- [x] build 2 于 2026-09-27 22:17:45 CST（UTC+8）上传 Apple 成功；日志显示 `Upload succeeded` / `EXPORT SUCCEEDED`，上传回执为 processing，后续处理完成状态未核实。归档分发记录同时确认 `adamId=6816674454`、`uploadedBuildNumber=2`、`uploadEvent.state=success`。
- [x] 在 `docs/ios-release.md` 准备中英商店、TestFlight、审核说明与发布命令草稿。
- [ ] 恢复可用的 App Store Connect 网页登录会话并核对 Apple 处理结果；目前 IAB 持续 `authResult=FAILED`、已知应用页面也超时，不是等待用户再次授权。
- [ ] 确认 build 2 的 Apple processing 已完成及实际可测试状态。
- [ ] 在平台填写真实测试说明及必需联系资料，提交外测审核；获准且构建可测试后才邀请已授权测试者。尚未提交外测审核，也未邀请测试者。
- [x] 源代码提交 `f4329a5` 已推送到 `origin/main`。
- [x] Pages CI `36325347248` 已 completed / success，npm test、类型检查、构建和部署全部成功；curl 开启 TLS 校验，个人图册 `?app=1`、`privacy.html`、`support.html` 均 HTTP 200；隐私页与支持页线上内容逐字节等于 Git 源码。
- [ ] 正式上架前准备真实应用截图、完整商店与审核资料，另行提交 App Store 审核；按真实平台结果记录状态。

验收依据：测试输出、模拟器实际操作、签名构建日志、App Store Connect 的实际处理/审核状态。没有有效登录或审核尚未通过时，准确记录可交付安装包与剩余阻塞，不代替用户编造账户资料。
